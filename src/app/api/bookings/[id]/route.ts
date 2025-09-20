// E:\mannsahay\src\app\api\bookings\[id]\route.ts
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

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        counselor: true,
        sessionNotes: {
          include: {
            counselor: {
              select: { name: true }
            }
          }
        },
        feedbacks: true,
        videoSession: true,
        reminders: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is authorized to view this booking
    if (booking.userId !== session.user.id && booking.counselorId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true }
      });

      if (!user?.isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, slotTime, notes } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { counselor: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is authorized to update this booking
    if (booking.userId !== session.user.id && booking.counselorId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true }
      });

      if (!user?.isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      
      // If booking is cancelled, make availability slot available again
      if (status === 'CANCELLED' && booking.availabilitySlotId) {
        await prisma.availabilitySlot.update({
          where: { id: booking.availabilitySlotId },
          data: { isBooked: false }
        });
      }
    }
    
    if (slotTime) {
      updateData.slotTime = new Date(slotTime);
      // Recalculate end time
      const sessionDuration = 50; // Default session duration in minutes
      updateData.endTime = new Date(new Date(slotTime).getTime() + sessionDuration * 60000);
    }
    
    if (notes) {
      updateData.notes = notes;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: updateData,
      include: {
        counselor: true,
        sessionNotes: {
          include: {
            counselor: {
              select: { name: true }
            }
          }
        },
        feedbacks: true,
        videoSession: true
      }
    });

    // Create notification for status change
    if (status) {
      const notificationRecipient = booking.userId === session.user.id ? booking.counselorId : booking.userId;
      
      await prisma.notification.create({
        data: {
          title: `Booking ${status}`,
          message: `Your booking with ${booking.counselor.name} has been ${status.toLowerCase()}`,
          type: `BOOKING_${status}`,
          userId: notificationRecipient,
          metadata: {
            bookingId: booking.id,
            counselorName: booking.counselor.name
          }
        }
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is authorized to delete this booking
    if (booking.userId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true }
      });

      if (!user?.isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Make availability slot available again
    if (booking.availabilitySlotId) {
      await prisma.availabilitySlot.update({
        where: { id: booking.availabilitySlotId },
        data: { isBooked: false }
      });
    }

    await prisma.booking.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}