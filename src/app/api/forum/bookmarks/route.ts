// E:\mannsahay\src\app\api\forum\bookmarks\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        post: {
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match the expected format
    const transformedBookmarks = bookmarks.map(bookmark => ({
      ...bookmark.post,
      bookmark: {
        createdAt: bookmark.createdAt,
      },
    }));

    return NextResponse.json({ bookmarks: transformedBookmarks });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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