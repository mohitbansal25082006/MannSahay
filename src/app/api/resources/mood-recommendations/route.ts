// E:\mannsahay\src\app\api\resources\mood-recommendations\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

interface MoodHistory {
  mood: number;
  createdAt: Date;
}

interface ResourceRating {
  rating: number;
}

interface ResourceCount {
  ratings: number;
  bookmarks: number;
}

interface Resource {
  id: string;
  title: string;
  categories: string[];
  viewCount: number;
  createdAt: Date;
  isPublished: boolean;
  _count: ResourceCount;
  ratings: ResourceRating[];
}

interface AIRecommendation {
  resourceId: string;
  title: string;
  reason: string;
  mood: 'low' | 'medium' | 'high';
}

interface AIResponse {
  recommendations: AIRecommendation[];
}

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
      ? user.moodHistory.reduce((sum: number, mood: MoodHistory) => sum + mood.mood, 0) / user.moodHistory.length
      : 5;

    // Define mood-appropriate categories
    const moodCategories = {
      low: ['wellness', 'mindfulness', 'stress-relief', 'anxiety', 'depression', 'emotional-support'],
      medium: ['education', 'self-help', 'coping-skills', 'personal-development'],
      high: ['personal-growth', 'motivation', 'achievement', 'confidence', 'goal-setting']
    };

    // Get existing resources that match the criteria
    const existingResources = await prisma.resource.findMany({
      where: {
        isPublished: true,
        id: { not: resourceId }, // Exclude current resource
        OR: [
          // Match by categories
          {
            categories: {
              hasSome: categories
            }
          },
          // Or by mood-appropriate categories
          ...(mood < 4 ? [{
            categories: {
              hasSome: moodCategories.low
            }
          }] : mood > 7 ? [{
            categories: {
              hasSome: moodCategories.high
            }
          }] : [{
            categories: {
              hasSome: moodCategories.medium
            }
          }])
        ]
      },
      take: 15, // Get more resources to choose from
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
      orderBy: [
        { viewCount: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    // Calculate average ratings for resources
    const resourcesWithRatings = existingResources.map((resource: Resource) => {
      const avgRating = resource.ratings.length > 0
        ? resource.ratings.reduce((sum: number, rating: ResourceRating) => sum + rating.rating, 0) / resource.ratings.length
        : 0;
      
      return {
        ...resource,
        averageRating: parseFloat(avgRating.toFixed(1)),
        engagement: resource._count.bookmarks + resource._count.ratings
      };
    });

    // If no resources found, return empty recommendations
    if (resourcesWithRatings.length === 0) {
      return NextResponse.json({ 
        recommendations: [],
        message: 'No similar resources found'
      });
    }

    // Get mood-based recommendations using AI
    const prompt = `Based on the user's current mood (average: ${avgMood}/10) and the resource categories (${categories.join(', ')}), recommend 3 resources from the following list that would be beneficial.

Available Resources:
${resourcesWithRatings.map((r, i) => 
  `${i + 1}. ID: ${r.id}, Title: ${r.title}, Categories: [${r.categories.join(', ')}], Rating: ${r.averageRating}, Views: ${r.viewCount}, Engagement: ${r.engagement}`
).join('\n')}

Consider:
1. If mood is low (1-4): Recommend uplifting, calming, or supportive resources
2. If mood is medium (5-7): Recommend educational or skill-building resources
3. If mood is high (8-10): Recommend challenging or growth-oriented resources

IMPORTANT: Only recommend resources from the provided list. Do not make up resource titles or IDs.

Please respond with a JSON object containing:
{
  "recommendations": [
    {
      "resourceId": "resource_id_from_list",
      "title": "Resource Title From List",
      "reason": "Brief explanation of why this resource is recommended",
      "mood": "low" or "medium" or "high"
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
    console.log('AI Response:', content); // Log for debugging
    
    let data: AIResponse;
    try {
      data = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json(
        { 
          error: 'Failed to parse AI response',
          rawResponse: content 
        },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (!data.recommendations || !Array.isArray(data.recommendations)) {
      console.error('Invalid AI response structure:', data);
      return NextResponse.json(
        { 
          error: 'Invalid AI response structure',
          data 
        },
        { status: 500 }
      );
    }

    // Ensure all recommended resources exist in our database
    const validRecommendations = data.recommendations.filter((rec: AIRecommendation) => 
      resourcesWithRatings.some(r => r.id === rec.resourceId)
    );

    // If no valid recommendations, return some default ones
    if (validRecommendations.length === 0) {
      // Fallback to top 3 resources by engagement
      const fallbackRecommendations = resourcesWithRatings
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 3)
        .map(resource => ({
          resourceId: resource.id,
          title: resource.title,
          reason: `Popular resource in ${resource.categories[0] || 'general'} category`,
          mood: avgMood < 4 ? 'low' : avgMood > 7 ? 'high' : 'medium'
        }));

      return NextResponse.json({ 
        recommendations: fallbackRecommendations,
        message: 'Using fallback recommendations based on popularity'
      });
    }

    return NextResponse.json({ 
      recommendations: validRecommendations,
      message: 'AI-powered recommendations generated successfully'
    });
  } catch (error) {
    console.error('Error getting mood-based recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}