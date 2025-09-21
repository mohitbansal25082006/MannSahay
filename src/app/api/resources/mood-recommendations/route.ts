// E:\mannsahay\src\app\api\resources\mood-recommendations\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { resourceId, categories } = await request.json();
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

    // Get mood-based recommendations using AI
    const prompt = `Based on the user's current mood (average: ${avgMood}/10) and the resource categories (${categories.join(', ')}), recommend 3 similar resources that would be beneficial.

Consider:
1. If mood is low (1-4): Recommend uplifting, calming, or supportive resources
2. If mood is medium (5-7): Recommend educational or skill-building resources
3. If mood is high (8-10): Recommend challenging or growth-oriented resources

Please respond in JSON format with an array of recommendations, each including:
- title (string)
- reason (string)
- mood (string: "low", "medium", or "high")

Example:
{
  "recommendations": [
    {
      "title": "Resource Title",
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

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting mood-based recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}