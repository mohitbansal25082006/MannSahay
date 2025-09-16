import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ChatHistoryManager } from '@/lib/chatUtils';

export async function POST(request: NextRequest) {
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

    const { daysToKeep = 30 } = await request.json();

    const deletedCount = await ChatHistoryManager.cleanupOldSessions(user.id, daysToKeep);

    return new Response(JSON.stringify({ 
      success: true, 
      deletedSessions: deletedCount,
      message: `Cleaned up ${deletedCount} old chat sessions`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}