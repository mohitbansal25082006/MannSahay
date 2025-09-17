// src/app/api/forum/replies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { assessRiskLevel } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, postId, parentId } = await request.json();

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

    // Create the reply
    const reply = await prisma.reply.create({
      data: {
        content,
        flagged,
        riskLevel,
        postId,
        authorId: session.user.id,
        parentId,
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

    // If flagged, create notification for counselors
    if (flagged) {
      const counselors = await prisma.user.findMany({
        where: { isAdmin: true },
      });

      for (const counselor of counselors) {
        await prisma.notification.create({
          data: {
            title: 'Flagged Reply',
            message: `A new reply has been flagged for review. Risk level: ${riskLevel}`,
            type: 'flagged_content',
            userId: counselor.id,
          },
        });
      }
    }

    // Create notification for post author
    if (post.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          title: 'New Reply',
          message: `Someone replied to your post`,
          type: 'reply',
          userId: post.authorId,
        },
      });
    }

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error('Create reply error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}