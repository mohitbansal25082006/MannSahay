// E:\mannsahay\src\app\api\resources\[id]\quality-analysis\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

export async function POST(
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

    // Get resource details
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Analyze content quality using AI
    const prompt = `Analyze the quality of the following mental health resource content. Provide a comprehensive assessment including:

1. Overall quality score (1-10)
2. Assessment of content accuracy, clarity, and usefulness
3. Suggestions for improvement (if any)

Content:
Title: ${resource.title}
Description: ${resource.description || ''}
Content: ${resource.content || ''}
Type: ${resource.type}
Categories: ${resource.categories.join(', ')}

Please respond in JSON format with the following structure:
{
  "score": number,
  "assessment": "string",
  "suggestions": ["string1", "string2", ...]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in mental health content analysis. Provide accurate, constructive assessments of resource quality.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    const analysis = JSON.parse(content);

    // Save the analysis to the resource
    await prisma.resource.update({
      where: { id: resourceId },
      data: {
        // Store quality analysis in a JSON field
        // You might need to add a field to your schema for this
      },
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing content quality:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content quality' },
      { status: 500 }
    );
  }
}