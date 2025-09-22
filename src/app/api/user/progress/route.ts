// E:\mannsahay\src\app\api\user\progress\route.ts
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

    // Get user's mood history - FIXED: Correct model reference
    const moodHistory = await prisma.moodEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' }
    });

    // Get user's booking history
    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: {
        counselor: true,
        feedbacks: true
      },
      orderBy: { slotTime: 'asc' }
    });

    // Calculate mood trends - FIXED: Ensure proper data structure
    const moodTrends = moodHistory.map(entry => ({
      date: entry.createdAt.toISOString().split('T')[0],
      mood: entry.mood
    }));

    // Calculate session statistics
    const sessionStats = {
      totalSessions: bookings.length,
      completedSessions: bookings.filter(b => b.status === 'COMPLETED').length,
      upcomingSessions: bookings.filter(b => b.status === 'CONFIRMED' && new Date(b.slotTime) > new Date()).length,
      cancelledSessions: bookings.filter(b => b.status === 'CANCELLED').length,
      averageRating: bookings.reduce((sum, booking) => {
        const avgRating = booking.feedbacks.reduce((feedbackSum, feedback) => feedbackSum + feedback.rating, 0) / booking.feedbacks.length;
        return sum + (isNaN(avgRating) ? 0 : avgRating);
      }, 0) / (bookings.length || 1)
    };

    // Calculate counselor distribution
    const counselorDistribution = bookings.reduce((acc, booking) => {
      const counselorName = booking.counselor.name;
      acc[counselorName] = (acc[counselorName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      moodTrends,
      sessionStats,
      counselorDistribution,
      recentSessions: bookings.slice(-5),
      recentNotes: [] // We'll implement this later
    });
  } catch (error) {
    console.error('Error fetching progress data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}