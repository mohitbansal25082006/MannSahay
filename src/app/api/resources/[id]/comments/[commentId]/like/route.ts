// E:\mannsahay\src\app\api\resources\[id]\comments\[commentId]\like\route.ts
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

    // Check if user already liked this comment
    const existingLike = await prisma.resourceCommentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId,
        },
      },
    });

    if (existingLike) {
      // Unlike the comment
      await prisma.resourceCommentLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      return NextResponse.json({ 
        liked: false,
        likeCount: await prisma.resourceCommentLike.count({
          where: { commentId },
        }),
      });
    } else {
      // Like the comment
      await prisma.resourceCommentLike.create({
        data: {
          userId: session.user.id,
          commentId,
        },
      });

      return NextResponse.json({ 
        liked: true,
        likeCount: await prisma.resourceCommentLike.count({
          where: { commentId },
        }),
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}