// E:\mannsahay\src\app\api\waitlist\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const waitlistEntries = await prisma.waitlistEntry.findMany({
      where: { userId: session.user.id },
      include: {
        counselor: {
          select: { name: true, specialties: true, languages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(waitlistEntries);
  } catch (error) {
    console.error('Error fetching waitlist entries:', error);
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
    const { counselorId, preferredDay, preferredTime, notes } = body;

    // Check if already on waitlist for this counselor
    const existingEntry = await prisma.waitlistEntry.findUnique({
      where: {
        userId_counselorId: {
          userId: session.user.id,
          counselorId
        }
      }
    });

    if (existingEntry) {
      return NextResponse.json({ error: 'Already on waitlist for this counselor' }, { status: 400 });
    }

    const waitlistEntry = await prisma.waitlistEntry.create({
      data: {
        userId: session.user.id,
        counselorId,
        preferredDay,
        preferredTime,
        notes
      },
      include: {
        counselor: {
          select: { name: true }
        }
      }
    });

    // Check if the counselor has a user account before creating a notification
    const counselorUser = await prisma.user.findUnique({
      where: { id: counselorId }
    });

    // Only create notification if the counselor has a user account
    if (counselorUser) {
      await prisma.notification.create({
        data: {
          title: 'New Waitlist Entry',
          message: `A client has joined your waitlist`,
          type: 'WAITLIST_ENTRY',
          userId: counselorId,
          metadata: {
            waitlistEntryId: waitlistEntry.id
          }
        }
      });
    } else {
      console.log(`Skipping notification for counselor ${counselorId} as they don't have a user account`);
    }

    return NextResponse.json(waitlistEntry, { status: 201 });
  } catch (error) {
    console.error('Error joining waitlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}