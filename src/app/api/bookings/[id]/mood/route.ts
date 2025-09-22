import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    const { mood, notes, isBeforeSession } = body;

    // Validate mood value
    if (typeof mood !== 'number' || mood < 1 || mood > 10) {
      return NextResponse.json({ error: 'Mood must be a number between 1 and 10' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        userId: true,
        slotTime: true,
        status: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is authorized to add mood for this booking
    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if booking is in a valid state for mood entry
    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Cannot add mood entry for cancelled booking' }, { status: 400 });
    }

    const moodEntry = await prisma.moodEntry.create({
      data: {
        mood,
        notes,
        userId: session.user.id,
        bookingId: bookingId
      }
    });

    return NextResponse.json(moodEntry, { status: 201 });
  } catch (error) {
    console.error('Error recording mood:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        userId: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is authorized to view mood entries for this booking
    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const moodEntries = await prisma.moodEntry.findMany({
      where: {
        bookingId: bookingId,
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(moodEntries);
  } catch (error) {
    console.error('Error fetching mood entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}