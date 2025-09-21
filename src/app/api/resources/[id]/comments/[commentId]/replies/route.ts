// E:\mannsahay\src\app\api\resources\[id]\comments\[commentId]\replies\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  context: { 
    params: Promise<{ 
      id: string; 
      commentId: string 
    }> | { 
      id: string; 
      commentId: string 
    } 
  }
) {
  try {
    // Await params to handle cases where it's a Promise
    const params = await ('then' in context.params ? context.params : Promise.resolve(context.params));
    const resourceId = params.id;
    const commentId = params.commentId;

    // Validate resourceId and commentId
    if (!resourceId || typeof resourceId !== 'string' || 
        !commentId || typeof commentId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid resource ID or comment ID' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reply content is required' },
        { status: 400 }
      );
    }

    // Verify the parent comment exists
    const parentComment = await prisma.resourceComment.findUnique({
      where: { id: commentId },
    });

    if (!parentComment) {
      return NextResponse.json(
        { error: 'Parent comment not found' },
        { status: 404 }
      );
    }

    // Create the reply
    const reply = await prisma.resourceComment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        resourceId,
        parentId: commentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return NextResponse.json(reply);
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
}