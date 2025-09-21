// E:\mannsahay\src\app\api\bookings\[id]\video-link\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { counselor: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is authorized to generate video link
    if (booking.userId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true }
      });

      if (!user?.isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Generate a unique meeting ID
    const meetingId = `meet-${booking.id}-${Date.now()}`;
    
    // Generate Google Meet URL
    const meetingUrl = `https://meet.google.com/${meetingId.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 10)}`;
    const hostUrl = `${meetingUrl}?authuser=0&hs=1`;

    // Update or create video session
    const videoSession = await prisma.videoSession.upsert({
      where: { bookingId: booking.id },
      update: {
        meetingId,
        meetingUrl,
        hostUrl
      },
      create: {
        platform: 'GOOGLE_MEET',
        meetingId,
        meetingUrl,
        hostUrl,
        bookingId: booking.id
      }
    });

    return NextResponse.json(videoSession);
  } catch (error) {
    console.error('Error generating video link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}