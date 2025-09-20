// E:\mannsahay\src\app\api\bookings\[id]\mood\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    const { mood, notes, isBeforeSession } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is authorized to add mood for this booking
    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const moodEntry = await prisma.moodEntry.create({
      data: {
        mood,
        notes,
        userId: session.user.id,
        bookingId: params.id
      }
    });

    return NextResponse.json(moodEntry, { status: 201 });
  } catch (error) {
    console.error('Error recording mood:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}