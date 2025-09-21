// E:\mannsahay\src\app\api\resources\[id]\analytics\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Await params to handle cases where it's a Promise
    const params = await ('then' in context.params ? context.params : Promise.resolve(context.params));
    const resourceId = params.id;

    // Validate resourceId
    if (!resourceId || typeof resourceId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid resource ID' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get resource details with engagement metrics
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        _count: {
          select: {
            ratings: true,
            bookmarks: true,
            downloads: true,
            views: true,
            comments: true,
          },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const avgRating = resource.ratings.length > 0
      ? resource.ratings.reduce((sum, rating) => sum + rating.rating, 0) / resource.ratings.length
      : 0;

    // Get user engagement data - count unique users
    const uniqueUsersCount = await prisma.resourceView.groupBy({
      by: ['userId'],
      where: {
        resourceId,
        userId: {
          not: null,
        },
      },
      _count: {
        userId: true,
      },
    });

    // Calculate trending status (simple heuristic)
    const isTrending = resource.viewCount > 100 && resource.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return NextResponse.json({
      viewCount: resource.viewCount,
      downloadCount: resource.downloadCount,
      averageRating: parseFloat(avgRating.toFixed(1)),
      userEngagement: {
        uniqueUsers: uniqueUsersCount.length,
        completionRate: 75, // Placeholder - would need actual time tracking
        bookmarks: resource._count.bookmarks,
      },
      trending: isTrending,
      moodBasedRecommendations: [] // Initialize as empty array
    });
  } catch (error) {
    console.error('Error fetching resource analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}