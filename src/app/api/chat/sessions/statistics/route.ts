import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ChatHistoryManager } from '@/lib/chatUtils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    const statistics = await ChatHistoryManager.getChatStatistics(user.id);

    return new Response(JSON.stringify({ statistics }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Statistics error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}