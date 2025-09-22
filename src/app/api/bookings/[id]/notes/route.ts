import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET handler to fetch session notes
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await the params Promise
    const resolvedParams = await params;
    const bookingId = resolvedParams.id;

    // First check if booking exists and user has access
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { 
        id: true,
        userId: true, 
        counselorId: true,
        status: true
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user has permission to view notes for this booking
    const isPatient = booking.userId === session.user.id;
    const isCounselor = booking.counselorId === session.user.id;
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    const isAdmin = user?.isAdmin || false;

    if (!isPatient && !isCounselor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const notes = await prisma.sessionNote.findMany({
      where: { bookingId: bookingId },
      include: {
        counselor: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter notes based on privacy settings and user role
    const filteredNotes = notes.filter((note) => {
      // Non-private notes are visible to all authorized users
      if (!note.isPrivate) return true;
      
      // Private notes are only visible to:
      // 1. The counselor who wrote them
      // 2. Admins
      return note.counselorId === session.user.id || isAdmin;
    });

    return NextResponse.json(filteredNotes);
  } catch (error) {
    console.error('Error fetching session notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST handler to create a new session note
export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await the params Promise
    const resolvedParams = await params;
    const bookingId = resolvedParams.id;

    const body = await request.json();
    const { content, isPrivate } = body;

    // Validate input
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Content too long (max 5000 characters)' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        counselor: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is authorized to add notes for this booking
    const isCounselor = booking.counselorId === session.user.id;
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    const isAdmin = user?.isAdmin || false;

    if (!isCounselor && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Only counselors and admins can create session notes' }, { status: 403 });
    }

    // Check if booking is in a valid state for notes
    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Cannot add notes to cancelled booking' }, { status: 400 });
    }

    const note = await prisma.sessionNote.create({
      data: {
        content: content.trim(),
        isPrivate: isPrivate ?? false,
        userId: booking.userId,
        counselorId: booking.counselorId,
        bookingId: bookingId,
      },
      include: {
        counselor: {
          select: { name: true },
        },
      },
    });

    // If note is not private, notify the patient
    if (!note.isPrivate && booking.user) {
      try {
        await prisma.notification.create({
          data: {
            title: 'New Session Note',
            message: `${booking.counselor.name} added a note to your session`,
            type: 'SESSION_NOTE',
            userId: booking.userId,
            metadata: {
              bookingId: booking.id,
              counselorName: booking.counselor.name,
              noteId: note.id,
            },
          },
        });
      } catch (notificationError) {
        // Log the error but don't fail the note creation
        console.error('Error creating notification:', notificationError);
      }
    }

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating session note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT handler to update an existing session note
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await the params Promise
    const resolvedParams = await params;
    const bookingId = resolvedParams.id;

    const body = await request.json();
    const { noteId, content, isPrivate } = body;

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    // Validate input
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length > 5000) {
      return NextResponse.json({ error: 'Content too long (max 5000 characters)' }, { status: 400 });
    }

    const note = await prisma.sessionNote.findUnique({
      where: { id: noteId },
      include: {
        counselor: {
          select: { name: true }
        }
      }
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (note.bookingId !== bookingId) {
      return NextResponse.json({ error: 'Note does not belong to this booking' }, { status: 400 });
    }

    // Check if user is authorized to update this note
    const isCounselorWhoWroteNote = note.counselorId === session.user.id;
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    const isAdmin = user?.isAdmin || false;

    if (!isCounselorWhoWroteNote && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden - You can only update notes you created' }, { status: 403 });
    }

    const updatedNote = await prisma.sessionNote.update({
      where: { id: noteId },
      data: {
        content: content.trim(),
        isPrivate: isPrivate ?? note.isPrivate,
        updatedAt: new Date(),
      },
      include: {
        counselor: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Error updating session note:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}