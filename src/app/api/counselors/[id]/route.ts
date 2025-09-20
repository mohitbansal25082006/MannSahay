// E:\mannsahay\src\app\api\counselors\[id]\route.ts
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

    const counselor = await prisma.counselor.findUnique({
      where: { id: params.id },
      include: {
        availability: {
          where: { isBooked: false },
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
          ]
        },
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ['CONFIRMED', 'PENDING'] },
                slotTime: { gte: new Date() }
              }
            }
          }
        }
      }
    });

    if (!counselor) {
      return NextResponse.json({ error: 'Counselor not found' }, { status: 404 });
    }

    return NextResponse.json(counselor);
  } catch (error) {
    console.error('Error fetching counselor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}