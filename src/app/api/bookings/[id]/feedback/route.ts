// E:\mannsahay\src\app\api\bookings\[id]\feedback\route.ts
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
    const { rating, content } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is authorized to provide feedback for this booking
    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.feedback.findFirst({
      where: { bookingId: params.id }
    });

    if (existingFeedback) {
      return NextResponse.json({ error: 'Feedback already submitted' }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        rating,
        content,
        userId: session.user.id,
        bookingId: params.id
      }
    });

    // Create notification for counselor
    await prisma.notification.create({
      data: {
        title: 'New Feedback Received',
        message: `You have received new feedback for your session`,
        type: 'NEW_FEEDBACK',
        userId: booking.counselorId,
        metadata: {
          bookingId: booking.id,
          rating
        }
      }
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}