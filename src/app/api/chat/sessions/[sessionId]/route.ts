// File: src/app/api/chat/sessions/[sessionId]/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET: Get specific chat session with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
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

    // Get chat session with messages
    const chatSession = await prisma.chatSession.findFirst({
      where: { 
        id: sessionId,
        userId: user.id
      },
      include: {
        chats: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!chatSession) {
      return new Response('Chat session not found', { status: 404 });
    }

    // Mark as active session
    await prisma.chatSession.updateMany({
      where: { 
        userId: user.id,
        isActive: true
      },
      data: { isActive: false }
    });

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { isActive: true }
    });

    return new Response(JSON.stringify({ session: chatSession }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat session GET error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// PUT: Update chat session (rename, archive)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
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

    const { title, isArchived } = await request.json();

    const updatedSession = await prisma.chatSession.update({
      where: { 
        id: sessionId,
        userId: user.id
      },
      data: {
        ...(title !== undefined && { title }),
        ...(isArchived !== undefined && { isArchived }),
        updatedAt: new Date()
      }
    });

    return new Response(JSON.stringify({ session: updatedSession }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat session PUT error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// DELETE: Delete chat session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
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

    // Delete chat session and all associated messages (cascade)
    await prisma.chatSession.delete({
      where: { 
        id: sessionId,
        userId: user.id
      }
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat session DELETE error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}