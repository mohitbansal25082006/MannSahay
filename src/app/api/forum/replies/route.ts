import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { assessRiskLevel } from '@/lib/openai';
import { moderateContent } from '@/lib/ai-moderation';
import { ModerationStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, postId, parentId, language = 'en' } = await request.json();

    if (!content || content.trim() === '' || !postId) {
      return NextResponse.json({ error: 'Content and postId are required' }, { status: 400 });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Assess risk level using AI
    const riskLevel = assessRiskLevel(content);
    const flagged = riskLevel === 'MEDIUM' || riskLevel === 'HIGH';

    // Moderate content using AI with language parameter
    const moderationResult = await moderateContent(content, language);
    
    // Generate writing suggestions and tone analysis
    let writingSuggestions = null;
    let toneAnalysis = null;
    
    try {
      const [suggestionsResponse, toneResponse] = await Promise.all([
        fetch(`${process.env.NEXTAUTH_URL}/api/forum/suggestions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: content, language })
        }),
        fetch(`${process.env.NEXTAUTH_URL}/api/forum/tone-analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: content, language })
        })
      ]);
      
      if (suggestionsResponse.ok) {
        writingSuggestions = await suggestionsResponse.json();
      }
      
      if (toneResponse.ok) {
        toneAnalysis = await toneResponse.json();
      }
    } catch (error) {
      console.error('Error generating suggestions/tone analysis:', error);
    }
    
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

    // Create the reply
    const reply = await prisma.reply.create({
      data: {
        content,
        flagged: flagged || moderationResult.violatesPolicy,
        riskLevel,
        postId,
        authorId: session.user.id,
        parentId,
        language,
        moderationStatus,
        moderationReason: moderationResult.violatesPolicy ? moderationResult.violationTypes.join(', ') : null,
        moderationNote,
        moderatedAt: moderationResult.violatesPolicy ? new Date() : null,
        isHidden,
        writingSuggestions,
        toneAnalysis,
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
          },
        },
      },
    });

    // Create notification for post author when someone replies
    if (post.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          title: 'New Reply on Your Post',
          message: `Someone replied to your post: "${post.title || 'Untitled'}"`,
          type: 'reply',
          userId: post.authorId,
          // Add post ID as metadata
          metadata: {
            postId: post.id,
            replyId: reply.id
          }
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
            title: moderationResult.violatesPolicy ? 'Policy Violation Detected' : 'Flagged Reply',
            message: `A reply has been ${moderationResult.violatesPolicy ? 'automatically flagged for policy violations' : 'flagged for review'}. Risk level: ${riskLevel}. Action: ${moderationResult.recommendedAction}`,
            type: 'flagged_content',
            userId: counselor.id,
          },
        });
      }
    }

    // Create notification for the user if their reply was flagged/removed
    if (moderationResult.violatesPolicy && moderationStatus === ModerationStatus.REJECTED) {
      await prisma.notification.create({
        data: {
          title: 'Your Reply Has Been Removed',
          message: `Your reply has been automatically removed for violating our community policies. ${moderationNote || ''}`,
          type: 'content_moderated',
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error('Create reply error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}