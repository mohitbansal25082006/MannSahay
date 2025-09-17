import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');

    if (!parentId) {
      return NextResponse.json({ error: 'Parent ID is required' }, { status: 400 });
    }

    const replies = await prisma.reply.findMany({
      where: { parentId },
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
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ replies });
  } catch (error) {
    console.error('Get replies by parent error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}