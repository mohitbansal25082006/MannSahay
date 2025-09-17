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

    const { content, postId, replyId } = await request.json();

    if (!content || content.trim() === '' || !postId || !replyId) {
      return NextResponse.json({ error: 'Content, postId, and replyId are required' }, { status: 400 });
    }

    // Check if the parent reply exists
    const parentReply = await prisma.reply.findUnique({
      where: { id: replyId },
      include: {
        post: true
      }
    });

    if (!parentReply) {
      return NextResponse.json({ error: 'Parent reply not found' }, { status: 404 });
    }

    // Assess risk level using AI
    const riskLevel = assessRiskLevel(content);
    const flagged = riskLevel === 'MEDIUM' || riskLevel === 'HIGH';

    // Create the nested reply
    const reply = await prisma.reply.create({
      data: {
        content,
        flagged,
        riskLevel,
        postId,
        authorId: session.user.id,
        parentId: replyId,
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
            message: `A new nested reply has been flagged for review. Risk level: ${riskLevel}`,
            type: 'flagged_content',
            userId: counselor.id,
          },
        });
      }
    }

    // Create notification for parent reply author
    if (parentReply.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          title: 'Reply to Your Comment',
          message: `Someone replied to your comment`,
          type: 'reply',
          userId: parentReply.authorId,
        },
      });
    }

    // Create notification for post author
    if (parentReply.post.authorId !== session.user.id && parentReply.post.authorId !== parentReply.authorId) {
      await prisma.notification.create({
        data: {
          title: 'New Reply on Your Post',
          message: `There's a new reply on your post`,
          type: 'reply',
          userId: parentReply.post.authorId,
        },
      });
    }

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error('Create nested reply error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}