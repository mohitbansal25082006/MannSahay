// E:\mannsahay\src\app\api\bookings\[id]\notes\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notes = await prisma.sessionNote.findMany({
      where: { bookingId: params.id },
      include: {
        counselor: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Check if user is authorized to view these notes
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      select: { userId: true, counselorId: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only show private notes to the counselor who wrote them or admins
    const filteredNotes = notes.filter(note => {
      if (!note.isPrivate) return true;
      return note.counselorId === session.user.id;
    });

    return NextResponse.json(filteredNotes);
  } catch (error) {
    console.error('Error fetching session notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, isPrivate } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { counselor: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is authorized to add notes for this booking
    if (booking.counselorId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true }
      });

      if (!user?.isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const note = await prisma.sessionNote.create({
      data: {
        content,
        isPrivate: isPrivate || false,
        userId: booking.userId,
        counselorId: booking.counselorId,
        bookingId: params.id
      },
      include: {
        counselor: {
          select: { name: true }
        }
      }
    });

    // If note is not private, notify the user
    if (!note.isPrivate) {
      await prisma.notification.create({
        data: {
          title: 'New Session Note',
          message: `${booking.counselor.name} added a note to your session`,
          type: 'SESSION_NOTE',
          userId: booking.userId,
          metadata: {
            bookingId: booking.id,
            counselorName: booking.counselor.name
          }
        }
      });
    }

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating session note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}