// src/app/api/forum/flag/route.ts
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

    const { postId, replyId, reason } = await request.json();

    if (!postId && !replyId) {
      return NextResponse.json({ error: 'postId or replyId is required' }, { status: 400 });
    }

    // Check if already flagged
    const existingFlag = await prisma.flag.findFirst({
      where: {
        userId: session.user.id,
        postId,
        replyId,
      },
    });

    if (existingFlag) {
      return NextResponse.json({ error: 'You have already flagged this content' }, { status: 400 });
    }

    // Create flag
    const flag = await prisma.flag.create({
      data: {
        reason,
        userId: session.user.id,
        postId,
        replyId,
      },
    });

    // Notify counselors
    const counselors = await prisma.user.findMany({
      where: { isAdmin: true },
    });

    for (const counselor of counselors) {
      await prisma.notification.create({
        data: {
          title: 'Content Flagged',
          message: `Content has been flagged by a user. Reason: ${reason}`,
          type: 'flagged_content',
          userId: counselor.id,
        },
      });
    }

    return NextResponse.json({ flag }, { status: 201 });
  } catch (error) {
    console.error('Flag error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}