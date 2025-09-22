import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params; // Await params to get the id
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const availabilityFilter: Prisma.AvailabilitySlotWhereInput = { 
      counselorId: id, 
      isBooked: false 
    };
    
    if (startDate && endDate) {
      // This would be more complex in a real implementation
      // For now, we'll just return all availability slots
    }

    const availability = await prisma.availabilitySlot.findMany({
      where: availabilityFilter,
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    // Format the time slots to return only the time part
    const formattedAvailability = availability.map(slot => ({
      ...slot,
      startTime: slot.startTime.toTimeString().slice(0, 5), // HH:MM format
      endTime: slot.endTime.toTimeString().slice(0, 5) // HH:MM format
    }));

    return NextResponse.json(formattedAvailability);
  } catch (error) {
    console.error('Error fetching counselor availability:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params; // Await params to get the id
    const body = await request.json();
    const { dayOfWeek, startTime, endTime } = body;

    // Check if user is a counselor or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if this slot already exists
    const existingSlot = await prisma.availabilitySlot.findUnique({
      where: {
        counselorId_dayOfWeek_startTime_endTime: {
          counselorId: id,
          dayOfWeek,
          startTime: new Date(`2000-01-01T${startTime}:00`),
          endTime: new Date(`2000-01-01T${endTime}:00`)
        }
      }
    });

    if (existingSlot) {
      return NextResponse.json({ error: 'This time slot already exists' }, { status: 400 });
    }

    const availability = await prisma.availabilitySlot.create({
      data: {
        counselorId: id,
        dayOfWeek,
        startTime: new Date(`2000-01-01T${startTime}:00`),
        endTime: new Date(`2000-01-01T${endTime}:00`)
      }
    });

    // Format the response
    const formattedAvailability = {
      ...availability,
      startTime: availability.startTime.toTimeString().slice(0, 5),
      endTime: availability.endTime.toTimeString().slice(0, 5)
    };

    return NextResponse.json(formattedAvailability, { status: 201 });
  } catch (error) {
    console.error('Error creating availability slot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}