import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { sendEmail, generateSessionCancellationEmail } from '@/lib/email';

export async function GET(
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
    if (booking.userId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true }
      });

      if (!user?.isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json(booking);
  } catch (error: unknown) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { status, slotTime, notes } = body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { counselor: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is authorized to update this booking
    if (booking.userId !== session.user.id) {
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
      where: { id },
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
      // Only create notification if the recipient exists in the users table
      const notificationRecipient = booking.userId === session.user.id ? booking.counselorId : booking.userId;
      
      // Check if the recipient exists in the users table
      const recipientUser = await prisma.user.findUnique({
        where: { id: notificationRecipient }
      });
      
      // Only create the notification if the user exists
      if (recipientUser) {
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
      } else {
        console.log(`Skipping notification for user ${notificationRecipient} as they don't exist in the users table`);
      }

      // Send cancellation email if status is CANCELLED
      if (status === 'CANCELLED') {
        try {
          const user = await prisma.user.findUnique({
            where: { id: booking.userId }
          });

          if (user?.email) {
            const emailHtml = generateSessionCancellationEmail(
              user.name || 'User',
              booking.counselor.name,
              booking.slotTime
            );

            await sendEmail({
              to: user.email,
              subject: 'Session Cancelled - MannSahay',
              html: emailHtml
            });
          }
        } catch (emailError) {
          console.error('Error sending cancellation email:', emailError);
          // Continue with the booking process even if email fails
        }
      }
    }

    return NextResponse.json(updatedBooking);
  } catch (error: unknown) {
    console.error('Error updating booking:', error);
    
    // Handle specific database errors
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ 
        error: 'Invalid reference: The specified user does not exist' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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
      where: { id }
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

    // Send cancellation email
    try {
      const user = await prisma.user.findUnique({
        where: { id: booking.userId }
      });
      const counselor = await prisma.counselor.findUnique({
        where: { id: booking.counselorId }
      });

      if (user?.email && counselor) {
        const emailHtml = generateSessionCancellationEmail(
          user.name || 'User',
          counselor.name,
          booking.slotTime
        );

        await sendEmail({
          to: user.email,
          subject: 'Session Cancelled - MannSahay',
          html: emailHtml
        });
      }
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
      // Continue with the deletion process even if email fails
    }

    await prisma.booking.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}