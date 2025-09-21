// E:\mannsahay\src\app\api\counselor\analytics\route.ts
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

    // Get counselor profile
    const counselor = await prisma.counselor.findFirst({
      where: { 
        OR: [
          { email: session.user.email || '' },
          { id: session.user.id }
        ]
      }
    });

    if (!counselor) {
      return NextResponse.json({ error: 'Counselor not found' }, { status: 404 });
    }

    // Get current date and date 6 months ago
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    // Get all bookings for this counselor
    const bookings = await prisma.booking.findMany({
      where: {
        counselorId: counselor.id,
        slotTime: { gte: sixMonthsAgo }
      },
      include: {
        feedbacks: true,
        moodEntries: true,
        user: {
          select: { name: true }
        }
      }
    });

    // Calculate basic statistics
    const totalSessions = bookings.length;
    const completedSessions = bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelledSessions = bookings.filter(b => b.status === 'CANCELLED').length;
    const upcomingSessions = bookings.filter(b => b.status === 'CONFIRMED' && new Date(b.slotTime) > now).length;

    // Calculate average rating
    const allFeedbacks = bookings.flatMap(b => b.feedbacks);
    const avgRating = allFeedbacks.length > 0 
      ? allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length 
      : 0;

    // Calculate unique clients
    const uniqueClients = new Set(bookings.map(b => b.userId)).size;
    const newClientsThisMonth = new Set(
      bookings
        .filter(b => new Date(b.createdAt) > new Date(now.getFullYear(), now.getMonth(), 1))
        .map(b => b.userId)
    ).size;

    // Calculate earnings (assuming $50 per session)
    const sessionRate = 50;
    const totalEarnings = completedSessions * sessionRate;

    // Group sessions by month
    const sessionByMonthMap = new Map<string, { sessions: number; earnings: number }>();
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      sessionByMonthMap.set(monthKey, { sessions: 0, earnings: 0 });
    }

    bookings.forEach(booking => {
      if (booking.status === 'COMPLETED') {
        const monthKey = new Date(booking.slotTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (sessionByMonthMap.has(monthKey)) {
          const monthData = sessionByMonthMap.get(monthKey)!;
          monthData.sessions += 1;
          monthData.earnings += sessionRate;
        }
      }
    });

    const sessionByMonth = Array.from(sessionByMonthMap.entries()).map(([month, data]) => ({
      month,
      sessions: data.sessions,
      earnings: data.earnings
    })).reverse();

    // Session status distribution
    const sessionByStatus = [
      { name: 'Completed', value: completedSessions, color: '#10B981' },
      { name: 'Cancelled', value: cancelledSessions, color: '#EF4444' },
      { name: 'Upcoming', value: upcomingSessions, color: '#3B82F6' }
    ];

    // Client satisfaction distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: allFeedbacks.filter(f => f.rating === rating).length
    }));

    // Top specializations
    const specializationCount = new Map<string, number>();
    bookings.forEach(booking => {
      if (booking.status === 'COMPLETED') {
        counselor.specialties.forEach(specialty => {
          specializationCount.set(specialty, (specializationCount.get(specialty) || 0) + 1);
        });
      }
    });

    const topSpecializations = Array.from(specializationCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Mood trends
    const moodTrendsMap = new Map<string, { sum: number; count: number }>();
    
    bookings.forEach(booking => {
      booking.moodEntries.forEach(entry => {
        const dateKey = entry.createdAt.toISOString().split('T')[0];
        if (!moodTrendsMap.has(dateKey)) {
          moodTrendsMap.set(dateKey, { sum: 0, count: 0 });
        }
        const moodData = moodTrendsMap.get(dateKey)!;
        moodData.sum += entry.mood;
        moodData.count += 1;
      });
    });

    const moodTrends = Array.from(moodTrendsMap.entries())
      .map(([date, data]) => ({
        date,
        avgMood: data.sum / data.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days

    // Recent feedback
    const recentFeedback = allFeedbacks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(feedback => {
        const booking = bookings.find(b => b.id === feedback.bookingId);
        return {
          id: feedback.id,
          clientName: booking?.user.name || 'Anonymous',
          rating: feedback.rating,
          comment: feedback.content || '',
          date: new Date(feedback.createdAt).toLocaleDateString()
        };
      });

    return NextResponse.json({
      totalSessions,
      completedSessions,
      cancelledSessions,
      upcomingSessions,
      avgRating,
      totalClients: uniqueClients,
      newClients: newClientsThisMonth,
      totalEarnings,
      sessionByMonth,
      sessionByStatus,
      clientSatisfaction: ratingDistribution,
      topSpecializations,
      moodTrends,
      recentFeedback
    });
  } catch (error) {
    console.error('Error fetching counselor analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}