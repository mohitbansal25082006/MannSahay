// E:\mannsahay\src\app\api\resources\[id]\comments\[commentId]\flag\route.ts
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

    const { reason } = await request.json();

    // Check if user already flagged this comment
    const existingFlag = await prisma.resourceCommentFlag.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });

    if (existingFlag) {
      return NextResponse.json(
        { error: 'You have already flagged this comment' },
        { status: 400 }
      );
    }

    // Create the flag
    const flag = await prisma.resourceCommentFlag.create({
      data: {
        userId: session.user.id,
        commentId,
        reason: reason || 'Inappropriate content',
      },
    });

    return NextResponse.json({ 
      success: true,
      flagId: flag.id,
    });
  } catch (error) {
    console.error('Error flagging comment:', error);
    return NextResponse.json(
      { error: 'Failed to flag comment' },
      { status: 500 }
    );
  }
}