// E:\mannsahay\src\app\api\resources\mood-recommendations\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { resourceId, categories, mood } = await request.json();
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's mood history
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        moodHistory: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate average mood
    const avgMood = user.moodHistory.length > 0
      ? user.moodHistory.reduce((sum: number, mood: any) => sum + mood.mood, 0) / user.moodHistory.length
      : 5;

    // Get existing resources that match the criteria
    let whereClause: any = {
      isPublished: true,
      id: { not: resourceId }, // Exclude current resource
    };

    // Build category filter based on mood
    if (mood < 4) {
      // For low mood: wellness, mindfulness, stress-relief
      whereClause.categories = {
        hasSome: ['wellness', 'mindfulness', 'stress-relief']
      };
    } else if (mood > 7) {
      // For high mood: personal-growth, motivation, achievement
      whereClause.categories = {
        hasSome: ['personal-growth', 'motivation', 'achievement']
      };
    } else {
      // For medium mood: include all categories or match user preferences
      if (categories && categories.length > 0) {
        whereClause.categories = {
          hasSome: categories
        };
      }
    }

    const existingResources = await prisma.resource.findMany({
      where: whereClause,
      take: 10, // Get more resources to choose from
      include: {
        _count: {
          select: {
            ratings: true,
            bookmarks: true,
          },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Calculate average ratings for resources
    const resourcesWithRatings = existingResources.map(resource => {
      const avgRating = resource.ratings.length > 0
        ? resource.ratings.reduce((sum, rating) => sum + rating.rating, 0) / resource.ratings.length
        : 0;
      
      return {
        ...resource,
        averageRating: parseFloat(avgRating.toFixed(1)),
        engagement: resource._count.bookmarks + resource._count.ratings
      };
    });

    // Get mood-based recommendations using AI
    const prompt = `Based on the user's current mood (average: ${avgMood}/10) and the resource categories (${categories.join(', ')}), recommend 3 resources from the following list that would be beneficial.

Available Resources:
${resourcesWithRatings.map((r, i) => 
  `${i + 1}. ID: ${r.id}, Title: ${r.title}, Categories: ${r.categories.join(', ')}, Rating: ${r.averageRating}, Engagement: ${r.engagement}`
).join('\n')}

Consider:
1. If mood is low (1-4): Recommend uplifting, calming, or supportive resources
2. If mood is medium (5-7): Recommend educational or skill-building resources
3. If mood is high (8-10): Recommend challenging or growth-oriented resources

IMPORTANT: Only recommend resources from the provided list. Do not make up resource titles or IDs.

Please respond in JSON format with an array of recommendations, each including:
- resourceId (must be from the provided list)
- title (must be from the provided list)
- reason (brief explanation of why this resource is recommended)
- mood (string: "low", "medium", or "high")

Example:
{
  "recommendations": [
    {
      "resourceId": "resource_id_from_list",
      "title": "Resource Title From List",
      "reason": "This resource helps with...",
      "mood": "low"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in mental health resource recommendations. Provide personalized suggestions based on user mood and interests.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const data = JSON.parse(content);

    // Ensure all recommended resources exist in our database
    const validRecommendations = data.recommendations.filter((rec: any) => 
      resourcesWithRatings.some(r => r.id === rec.resourceId)
    );

    return NextResponse.json({ recommendations: validRecommendations });
  } catch (error) {
    console.error('Error getting mood-based recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}