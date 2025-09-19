// E:\mannsahay\src\app\api\forum\recommendations\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's interests and language preference
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        interests: true,
        preferredLanguage: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build the where clause for recommendations
    const whereClause: any = {
      isHidden: false,
      moderationStatus: 'APPROVED'
    };

    // Add conditions based on user preferences
    const conditions = [];

    // Match language preference
    if (user.preferredLanguage && user.preferredLanguage !== 'en') {
      conditions.push({ language: user.preferredLanguage });
    }

    // Match interests
    if (user.interests && user.interests.length > 0) {
      const interestConditions = user.interests.map((interest: string) => ({
        OR: [
          { title: { contains: interest, mode: 'insensitive' } },
          { content: { contains: interest, mode: 'insensitive' } },
          { category: { contains: interest, mode: 'insensitive' } }
        ]
      }));
      
      // Add all interest conditions with OR between them
      if (interestConditions.length > 0) {
        conditions.push({ OR: interestConditions });
      }
    }

    // If we have any conditions, add them to the where clause
    if (conditions.length > 0) {
      whereClause.OR = conditions;
    }

    // Find posts that match user's interests or language
    const recommendedPosts = await prisma.post.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            hashedId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
            bookmarks: true,
          },
        },
      },
      orderBy: [
        { likes: { _count: 'desc' } },
        { createdAt: 'desc' }
      ],
      take: 5
    });

    return NextResponse.json(recommendedPosts);
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}