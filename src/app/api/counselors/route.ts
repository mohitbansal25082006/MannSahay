import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const specialization = searchParams.get('specialization');
    const language = searchParams.get('language');
    const available = searchParams.get('available') === 'true';

    const whereClause: Prisma.CounselorWhereInput = { isActive: true };
    
    if (specialization && specialization !== 'all') {
      whereClause.specialties = {
        has: specialization
      };
    }
    
    if (language && language !== 'all') {
      whereClause.languages = {
        has: language
      };
    }

    const counselors = await prisma.counselor.findMany({
      where: whereClause,
      include: {
        availability: available ? {
          where: { isBooked: false },
          orderBy: { dayOfWeek: 'asc' }
        } : false,
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
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(counselors);
  } catch (error) {
    console.error('Error fetching counselors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}