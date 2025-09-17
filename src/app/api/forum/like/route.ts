// src/app/api/forum/like/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId, replyId } = await request.json();

    if (!postId && !replyId) {
      return NextResponse.json({ error: 'postId or replyId is required' }, { status: 400 });
    }

    // Check if already liked
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: session.user.id,
        postId,
        replyId,
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return NextResponse.json({ liked: false });
    } else {
      // Like
      const like = await prisma.like.create({
        data: {
          userId: session.user.id,
          postId,
          replyId,
        },
      });

      // If liking a reply, notify the reply author
      if (replyId) {
        const reply = await prisma.reply.findUnique({
          where: { id: replyId },
          include: { author: true },
        });

        if (reply && reply.authorId !== session.user.id) {
          await prisma.notification.create({
            data: {
              title: 'New Like',
              message: `Someone liked your reply`,
              type: 'like',
              userId: reply.authorId,
            },
          });
        }
      }

      return NextResponse.json({ liked: true, like });
    }
  } catch (error) {
    console.error('Like/Unlike error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}