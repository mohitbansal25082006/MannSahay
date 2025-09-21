// E:\mannsahay\src\app\api\user\notifications\[id]\read\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: id },
      data: { isRead: true }
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}