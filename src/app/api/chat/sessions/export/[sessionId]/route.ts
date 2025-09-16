import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ChatHistoryManager } from '@/lib/chatUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
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

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') as 'json' | 'txt' | 'csv' || 'json';

    const exportData = await ChatHistoryManager.exportChatHistory(
      params.sessionId,
      user.id,
      format
    );

    let contentType = 'application/json';
    let filename = `chat-${params.sessionId}.json`;

    if (format === 'txt') {
      contentType = 'text/plain';
      filename = `chat-${params.sessionId}.txt`;
    } else if (format === 'csv') {
      contentType = 'text/csv';
      filename = `chat-${params.sessionId}.csv`;
    }

    return new Response(exportData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}