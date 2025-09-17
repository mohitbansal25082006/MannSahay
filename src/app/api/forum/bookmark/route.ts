// src/app/api/forum/bookmark/route.ts
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

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: session.user.id,
        postId,
      },
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      return NextResponse.json({ bookmarked: false });
    } else {
      // Add bookmark
      const bookmark = await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          postId,
        },
      });
      return NextResponse.json({ bookmarked: true, bookmark });
    }
  } catch (error) {
    console.error('Bookmark/Unbookmark error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}