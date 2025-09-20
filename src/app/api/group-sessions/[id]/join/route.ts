import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupSession = await prisma.groupSession.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    });

    if (!groupSession) {
      return NextResponse.json({ error: 'Group session not found' }, { status: 404 });
    }

    // Check if session is full
    if (groupSession._count.participants >= groupSession.maxParticipants) {
      return NextResponse.json({ error: 'Session is full' }, { status: 400 });
    }

    // Check if user is already participating (this will now use the unique constraint)
    try {
      const participation = await prisma.groupSessionParticipant.create({
        data: {
          groupSessionId: params.id,
          userId: session.user.id
        }
      });

      // Notify user about joining the session
      await prisma.notification.create({
        data: {
          title: 'Joined Group Session',
          message: `You have successfully joined the group session: ${groupSession.title}`,
          type: 'GROUP_SESSION_JOINED',
          userId: session.user.id,
          metadata: {
            groupSessionId: groupSession.id,
            sessionDate: groupSession.sessionDate
          }
        }
      });

      return NextResponse.json(participation, { status: 201 });
    } catch (error: unknown) {
      // Handle unique constraint violation
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return NextResponse.json({ error: 'Already participating in this session' }, { status: 400 });
      }
      throw error;
    }
  } catch (error: unknown) {
    console.error('Error joining group session:', error);
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

    const participation = await prisma.groupSessionParticipant.findUnique({
      where: {
        groupSessionId_userId: {
          groupSessionId: params.id,
          userId: session.user.id
        }
      }
    });

    if (!participation) {
      return NextResponse.json({ error: 'Not participating in this session' }, { status: 404 });
    }

    await prisma.groupSessionParticipant.delete({
      where: {
        groupSessionId_userId: {
          groupSessionId: params.id,
          userId: session.user.id
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error leaving group session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}