// E:\mannsahay\src\app\api\bookings\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ReminderType } from '@/types';

// Define a type for Prisma errors that might have a code property
interface PrismaError extends Error {
  code?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';

    const whereClause: any = { userId: session.user.id };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (upcoming) {
      whereClause.slotTime = { gte: new Date() };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
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
      },
      orderBy: { slotTime: upcoming ? 'asc' : 'desc' }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      counselorId,
      slotTime,
      notes,
      sessionType,
      isRecurring,
      recurringPattern,
      recurringEndDate,
      availabilitySlotId
    } = body;

    // Validate required fields
    if (!counselorId || !slotTime) {
      return NextResponse.json({ error: 'Counselor ID and slot time are required' }, { status: 400 });
    }

    // Check if the counselor exists
    const counselor = await prisma.counselor.findUnique({
      where: { id: counselorId }
    });

    if (!counselor) {
      return NextResponse.json({ error: 'Counselor not found' }, { status: 404 });
    }

    // Get counselor details to calculate end time
    const counselorDetails = await prisma.counselor.findUnique({
      where: { id: counselorId },
      select: { bufferTimeMinutes: true }
    });

    if (!counselorDetails) {
      return NextResponse.json({ error: 'Counselor details not found' }, { status: 404 });
    }

    // Default session duration is 50 minutes
    const sessionDuration = 50;
    const bufferTime = counselorDetails.bufferTimeMinutes || 15;
    const endTime = new Date(new Date(slotTime).getTime() + sessionDuration * 60000);

    // Handle availability slot
    let slotToBook = null;
    
    if (availabilitySlotId) {
      // Verify the availability slot exists and belongs to this counselor
      slotToBook = await prisma.availabilitySlot.findFirst({
        where: {
          id: availabilitySlotId,
          counselorId: counselorId,
          isBooked: false
        }
      });

      if (!slotToBook) {
        return NextResponse.json({ error: 'Availability slot not found or already booked' }, { status: 404 });
      }
    } else {
      // If no availability slot ID is provided, try to find an available slot for the given time
      const slotDateTime = new Date(slotTime);
      const dayOfWeek = slotDateTime.getDay();
      const timeString = slotDateTime.toTimeString().slice(0, 5); // Get HH:MM format
      
      slotToBook = await prisma.availabilitySlot.findFirst({
        where: {
          counselorId: counselorId,
          dayOfWeek: dayOfWeek,
          startTime: {
            lte: new Date(`2000-01-01T${timeString}:00`)
          },
          endTime: {
            gte: new Date(`2000-01-01T${timeString}:00`)
          },
          isBooked: false
        }
      });

      if (!slotToBook) {
        // If no matching slot found, create the booking without linking to an availability slot
        console.log('No matching availability slot found, creating booking without slot reference');
      }
    }

    // Create the booking
    const bookingData: any = {
      userId: session.user.id,
      counselorId,
      slotTime: new Date(slotTime),
      endTime,
      notes,
      sessionType: sessionType || 'ONE_ON_ONE',
      isRecurring: isRecurring || false,
      recurringPattern,
      recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null
    };

    // Only include availabilitySlotId if we found a valid slot
    if (slotToBook) {
      bookingData.availabilitySlotId = slotToBook.id;
    }

    const booking = await prisma.booking.create({
      data: bookingData,
      include: {
        counselor: true
      }
    });

    // Update availability slot if we used one
    if (slotToBook) {
      await prisma.availabilitySlot.update({
        where: { id: slotToBook.id },
        data: { isBooked: true }
      });
    }

    // Create reminders
    const reminderTimes = [
      { type: ReminderType.EMAIL, hoursBefore: 24 },
      { type: ReminderType.EMAIL, hoursBefore: 2 },
      { type: ReminderType.SMS, hoursBefore: 2 }
    ];

    for (const reminder of reminderTimes) {
      const sendAt = new Date(new Date(slotTime).getTime() - reminder.hoursBefore * 60 * 60 * 1000);
      
      await prisma.reminder.create({
        data: {
          type: reminder.type,
          message: `Reminder: You have a counseling session with ${booking.counselor.name} on ${new Date(slotTime).toLocaleString()}`,
          sendAt,
          bookingId: booking.id
        }
      });
    }

    // Create video session
    const videoSession = await prisma.videoSession.create({
      data: {
        platform: 'GOOGLE_MEET',
        bookingId: booking.id
      }
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        title: 'Booking Confirmed',
        message: `Your session with ${booking.counselor.name} has been confirmed for ${new Date(slotTime).toLocaleString()}`,
        type: 'BOOKING_CONFIRMED',
        userId: session.user.id,
        metadata: {
          bookingId: booking.id,
          counselorName: booking.counselor.name
        }
      }
    });

    // Skip creating notification for counselor since counselors don't have user accounts
    // In a real implementation, you might want to:
    // 1. Create a user account for each counselor
    // 2. Send an email notification instead
    // 3. Use a separate notification system for counselors
    
    // For now, we'll just log that we would send a notification
    console.log(`Would send notification to counselor ${counselor.name} about new booking`);

    return NextResponse.json({ ...booking, videoSession }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    
    // Handle specific database errors with proper type checking
    const prismaError = error as PrismaError;
    if (prismaError.code === 'P2003') {
      return NextResponse.json({ 
        error: 'Invalid reference: The selected time slot is not available or does not exist' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}