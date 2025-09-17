import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { assessRiskLevel } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Unauthorized: Please sign in to create a post',
        debug: `Session status: ${session ? 'exists' : 'missing'}, User ID: ${session?.user?.id || 'missing'}`
      }, { status: 401 });
    }

    const { title, content, isAnonymous = true, category = 'general' } = await request.json();

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

    // Create the post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        isAnonymous,
        flagged,
        riskLevel,
        category,
        authorId: user.id,
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

    // If flagged, create notification for counselors
    if (flagged) {
      const counselors = await prisma.user.findMany({
        where: { isAdmin: true },
      });

      for (const counselor of counselors) {
        await prisma.notification.create({
          data: {
            title: 'Flagged Post',
            message: `A new post has been flagged for review. Risk level: ${riskLevel}`,
            type: 'flagged_content',
            userId: counselor.id,
          },
        });
      }
    }

    return NextResponse.json(post, { status: 201 });
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

    // Build where clause
    const where: any = {};
    
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