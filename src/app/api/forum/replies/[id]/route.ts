// E:\mannsahay\src\app\api\forum\replies\[id]\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('DELETE /api/forum/replies/[id] called with params:', params); // Add logging
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('Unauthorized: No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await the params before accessing its properties
    const { id: replyId } = await params;
    console.log('Reply ID:', replyId); // Log the reply ID

    // Check if reply exists
    const reply = await prisma.reply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      console.log('Reply not found for ID:', replyId);
      // If the reply doesn't exist, it might have already been deleted
      // Return success to prevent UI errors
      return NextResponse.json({ success: true, alreadyDeleted: true });
    }

    // Get the current user to check admin status
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    const isAuthor = reply.authorId === session.user.id;
    const isAdmin = currentUser?.isAdmin || false;

    if (!isAuthor && !isAdmin) {
      console.log('Forbidden: User is neither author nor admin');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the reply
    await prisma.reply.delete({
      where: { id: replyId },
    });

    console.log('Reply deleted successfully:', replyId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete reply error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}