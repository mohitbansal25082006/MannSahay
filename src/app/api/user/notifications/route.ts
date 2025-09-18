// E:\mannsahay\src\app\api\user\notifications\route.ts

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
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      userId: session.user.id,
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const totalCount = await prisma.notification.count({
      where,
    });

    return NextResponse.json({
      notifications,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationIds, isRead } = await request.json();

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'notificationIds is required and must be an array' }, { status: 400 });
    }

    const result = await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
        userId: session.user.id,
      },
      data: {
        isRead,
      },
    });

    return NextResponse.json({ 
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationIds } = await request.json();

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'notificationIds is required and must be an array' }, { status: 400 });
    }

    const result = await prisma.notification.deleteMany({
      where: {
        id: {
          in: notificationIds,
        },
        userId: session.user.id,
      },
    });

    return NextResponse.json({ 
      success: true,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Delete notifications error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}