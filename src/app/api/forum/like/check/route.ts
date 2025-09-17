import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const replyId = searchParams.get('replyId');
    const userId = searchParams.get('userId');

    if (!userId || (!postId && !replyId)) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    let like;
    
    if (postId) {
      like = await prisma.like.findFirst({
        where: { userId, postId },
      });
    } else if (replyId) {
      like = await prisma.like.findFirst({
        where: { userId, replyId },
      });
    }

    return NextResponse.json({ liked: !!like });
  } catch (error) {
    console.error('Like status check error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}