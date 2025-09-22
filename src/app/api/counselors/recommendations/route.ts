import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

// Define the Recommendation interface to type the recommendation objects
interface Recommendation {
  counselorId: string;
  score: string | number;
  reason: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { needs, preferences } = await request.json();
    
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        preferredSpecializations: true,
        preferredLanguages: true,
        interests: true,
        moodHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all active counselors
    const counselors = await prisma.counselor.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ['CONFIRMED', 'COMPLETED'] }
              }
            }
          }
        }
      }
    });

    // Create a prompt for AI to recommend counselors
    const prompt = `
    You are an expert counselor matching system for a mental health platform. Based on the user's needs and preferences, recommend the best counselors from the available list.

    User Information:
    - Needs: ${needs}
    - Preferred Specializations: ${user.preferredSpecializations?.join(', ') || 'None specified'}
    - Preferred Languages: ${user.preferredLanguages?.join(', ') || 'None specified'}
    - Interests: ${user.interests?.join(', ') || 'None specified'}
    - Recent Mood History: ${user.moodHistory.map(m => m.mood).join(', ')}

    Available Counselors:
    ${counselors.map(c => `
    - ID: ${c.id}
      Name: ${c.name}
      Specialties: ${c.specialties.join(', ')}
      Languages: ${c.languages.join(', ')}
      Experience: ${c.experience || 'Not specified'} years
      Bio: ${c.bio || 'Not provided'}
      Total Sessions: ${c._count.bookings}
    `).join('\n')}

    Please analyze the user's needs and preferences, then recommend the top 3 counselors who would be the best match.
    For each recommendation, provide:
    1. Counselor ID
    2. Match score (0-100)
    3. Detailed reason for the recommendation (2-3 sentences)

    Format your response as a JSON array with objects containing counselorId, score, and reason properties.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert counselor matching system. Provide personalized recommendations based on user needs and preferences.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const recommendations = JSON.parse(content);
    
    // Ensure the response is in the expected format
    let formattedRecommendations: Recommendation[] = [];
    if (recommendations.recommendations && Array.isArray(recommendations.recommendations)) {
      formattedRecommendations = recommendations.recommendations.map((rec: Recommendation) => ({
        counselorId: rec.counselorId,
        score: parseFloat(rec.score.toString()) || 0,
        reason: rec.reason || 'Recommended based on your preferences'
      }));
    }

    return NextResponse.json(formattedRecommendations);
  } catch (error) {
    console.error('Error generating counselor recommendations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}