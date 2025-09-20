// E:\mannsahay\src\app\api\group-sessions\route.ts
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

    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming') === 'true';

    const whereClause: any = {};
    
    if (upcoming) {
      whereClause.sessionDate = { gte: new Date() };
    }

    const groupSessions = await prisma.groupSession.findMany({
      where: whereClause,
      include: {
        counselor: {
          select: { name: true, profileImage: true }
        },
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { sessionDate: upcoming ? 'asc' : 'desc' }
    });

    // Check if user is participating in each session
    const sessionsWithParticipation = await Promise.all(
      groupSessions.map(async (sessionItem) => { // Renamed 'session' to 'sessionItem' to avoid confusion
        const participation = await prisma.groupSessionParticipant.findUnique({
          where: {
            groupSessionId_userId: {
              groupSessionId: sessionItem.id,
              userId: session.user.id // Now correctly accessing session.user.id
            }
          }
        });

        return {
          ...sessionItem,
          isParticipating: !!participation
        };
      })
    );

    return NextResponse.json(sessionsWithParticipation);
  } catch (error) {
    console.error('Error fetching group sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a counselor or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, maxParticipants, sessionDate, duration, counselorId } = body;

    const groupSession = await prisma.groupSession.create({
      data: {
        title,
        description,
        maxParticipants: maxParticipants || 10,
        sessionDate: new Date(sessionDate),
        duration: duration || 60,
        counselorId
      },
      include: {
        counselor: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(groupSession, { status: 201 });
  } catch (error) {
    console.error('Error creating group session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}