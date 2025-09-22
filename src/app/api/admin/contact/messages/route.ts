// E:\mannsahay\src\app\api\admin\contact\messages\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface WhereClause {
  status?: string;
  urgency?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');

    const where: WhereClause = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (urgency && urgency !== 'all') {
      where.urgency = urgency;
    }

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        replies: {
          orderBy: {
            sentAt: 'desc',
          },
          take: 1, // Get only the latest reply
        },
      },
    });

    return NextResponse.json({
      messages: messages.map(msg => ({
        id: msg.id,
        name: msg.name,
        email: msg.email,
        subject: msg.subject,
        message: msg.message,
        urgency: msg.urgency,
        status: msg.status,
        createdAt: msg.createdAt.toISOString(),
        lastReply: msg.replies[0] ? {
          content: msg.replies[0].content.substring(0, 100) + '...',
          sentAt: msg.replies[0].sentAt.toISOString(),
        } : null,
      })),
      total: messages.length,
    });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}