// File: src/app/api/chat/sessions/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET: Retrieve all chat sessions for a user
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

    // Get all chat sessions with message counts and latest message
    const chatSessions = await prisma.chatSession.findMany({
      where: { 
        userId: user.id,
        isArchived: false
      },
      include: {
        _count: {
          select: { chats: true }
        },
        chats: {
          take: 1,
          orderBy: { timestamp: 'desc' },
          select: {
            content: true,
            role: true,
            timestamp: true
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    return new Response(JSON.stringify({ sessions: chatSessions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat sessions GET error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// POST: Create a new chat session
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

    const { title, language = 'en' } = await request.json();

    // Deactivate current active session
    await prisma.chatSession.updateMany({
      where: { 
        userId: user.id,
        isActive: true
      },
      data: { isActive: false }
    });

    // Create new session
    const newSession = await prisma.chatSession.create({
      data: {
        userId: user.id,
        title: title || 'New Conversation',
        language,
        isActive: true
      }
    });

    return new Response(JSON.stringify({ session: newSession }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat session POST error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}