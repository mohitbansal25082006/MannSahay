import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { assessRiskLevel } from '@/lib/openai';
import { moderateContent, summarizeContent } from '@/lib/ai-moderation';
import { ModerationStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Unauthorized: Please sign in to create a post',
        debug: `Session status: ${session ? 'exists' : 'missing'}, User ID: ${session?.user?.id || 'missing'}`
      }, { status: 401 });
    }

    const { title, content, isAnonymous = true, category = 'general', language = 'en' } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Make sure the user exists in the database
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    // If user doesn't exist, create them
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.name || '',
            image: session.user.image || '',
            hashedId: session.user.hashedId || ''
          }
        });
      } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
      }
    }

    // Assess risk level using AI
    const riskLevel = assessRiskLevel(content);
    const flagged = riskLevel === 'MEDIUM' || riskLevel === 'HIGH';

    // Moderate content using AI with language parameter
    const moderationResult = await moderateContent(content, language);
    
    // Generate summary for the post
    const summaryResult = await summarizeContent(content);

    // Determine initial moderation status
    let moderationStatus: ModerationStatus = ModerationStatus.APPROVED;
    let isHidden = false;
    let moderationNote = '';
    
    if (moderationResult.violatesPolicy) {
      if (moderationResult.recommendedAction === 'remove') {
        moderationStatus = ModerationStatus.REJECTED;
        isHidden = true;
        moderationNote = `Automatically removed by AI: ${moderationResult.explanation}`;
      } else if (moderationResult.recommendedAction === 'hide') {
        moderationStatus = ModerationStatus.UNDER_REVIEW;
        isHidden = true;
        moderationNote = `Hidden pending review: ${moderationResult.explanation}`;
      } else if (moderationResult.recommendedAction === 'flag') {
        moderationStatus = ModerationStatus.UNDER_REVIEW;
        moderationNote = `Flagged for review: ${moderationResult.explanation}`;
      }
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        isAnonymous,
        flagged: flagged || moderationResult.violatesPolicy,
        riskLevel,
        category,
        authorId: user.id,
        moderationStatus,
        moderationReason: moderationResult.violatesPolicy ? moderationResult.violationTypes.join(', ') : null,
        moderationNote,
        moderatedAt: moderationResult.violatesPolicy ? new Date() : null,
        isHidden,
        summary: summaryResult.summary,
        summaryGeneratedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            hashedId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
            bookmarks: true,
          },
        },
      },
    });

    // Generate writing suggestions and tone analysis
    try {
      const [suggestions, toneAnalysis] = await Promise.all([
        fetch(`${process.env.NEXTAUTH_URL}/api/forum/suggestions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: content, language })
        }).then(res => res.ok ? res.json() : null),
        
        fetch(`${process.env.NEXTAUTH_URL}/api/forum/tone-analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: content, language })
        }).then(res => res.ok ? res.json() : null)
      ]);

      // Update the post with suggestions and tone analysis
      if (suggestions || toneAnalysis) {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            writingSuggestions: suggestions || null,
            toneAnalysis: toneAnalysis || null
          }
        });
      }
    } catch (error) {
      console.error('Error generating suggestions/tone analysis:', error);
    }

    // Create notification for the user if their post was flagged/removed
    if (moderationResult.violatesPolicy && moderationStatus === ModerationStatus.REJECTED) {
      await prisma.notification.create({
        data: {
          title: 'Your Post Has Been Removed',
          message: `Your post "${title || 'Untitled'}" has been automatically removed for violating our community policies. ${moderationNote || ''}`,
          type: 'content_moderated',
          userId: user.id,
        },
      });
    }

    // If flagged or requires review, create notification for counselors
    if (flagged || moderationStatus === ModerationStatus.UNDER_REVIEW) {
      const counselors = await prisma.user.findMany({
        where: { isAdmin: true },
      });

      for (const counselor of counselors) {
        await prisma.notification.create({
          data: {
            title: moderationResult.violatesPolicy ? 'Policy Violation Detected' : 'Flagged Post',
            message: `A post has been ${moderationResult.violatesPolicy ? 'automatically flagged for policy violations' : 'flagged for review'}. Risk level: ${riskLevel}. Action: ${moderationResult.recommendedAction}`,
            type: 'flagged_content',
            userId: counselor.id,
          },
        });
      }
    }

    return NextResponse.json({
      post,
      moderationStatus,
      moderationNote: moderationNote || (moderationResult.violatesPolicy ? moderationResult.explanation : ''),
      isHidden,
      wasRemoved: moderationStatus === ModerationStatus.REJECTED && isHidden,
      violationTypes: moderationResult.violatesPolicy ? moderationResult.violationTypes : []
    }, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ 
      error: 'Failed to create post. Please try again later.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || 'all';
    const sort = searchParams.get('sort') || 'latest';
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    // Build where clause - exclude hidden posts for regular users
    const where: any = {
      isHidden: false, // Only show non-hidden posts by default
    };
    
    if (category !== 'all') {
      where.category = category;
    }
    
    if (userId) {
      where.authorId = userId;
    }

    // Build orderBy
    const orderBy: any = {};
    if (sort === 'latest') {
      orderBy.createdAt = 'desc';
    } else if (sort === 'popular') {
      orderBy.likes = {
        _count: 'desc',
      };
    } else if (sort === 'discussed') {
      orderBy.replies = {
        _count: 'desc',
      };
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            hashedId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
            bookmarks: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    const total = await prisma.post.count({ where });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}