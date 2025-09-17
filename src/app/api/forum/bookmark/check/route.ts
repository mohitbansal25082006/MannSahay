import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const userId = searchParams.get('userId');

    if (!userId || !postId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const bookmark = await prisma.bookmark.findFirst({
      where: { userId, postId },
    });

    return NextResponse.json({ bookmarked: !!bookmark });
  } catch (error) {
    console.error('Bookmark status check error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}