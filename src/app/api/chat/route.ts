import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { openai, assessRiskLevel, systemPrompt } from '@/lib/openai';
import { prisma } from '@/lib/db';
import { OpenAIStream, StreamingTextResponse } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { message, language = 'en' } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response('Message is required', { status: 400 });
    }

    // Assess risk level
    const riskLevel = assessRiskLevel(message);

    // Save user message to database
    await prisma.chat.create({
      data: {
        userId: session.user.id,
        content: message,
        role: 'user',
        language,
        riskLevel: riskLevel as any
      }
    });

    // Get recent chat history for context
    const recentChats = await prisma.chat.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    // Build conversation history
    const messages = [
      {
        role: 'system' as const,
        content: `${systemPrompt}\n\nUser's preferred language: ${language === 'hi' ? 'Hindi' : 'English'}. You may mix Hindi and English naturally.`
      },
      ...recentChats.reverse().slice(0, 8).map(chat => ({
        role: chat.role as 'user' | 'assistant',
        content: chat.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ];

    // Add crisis response if high risk
    if (riskLevel === 'HIGH') {
      messages.unshift({
        role: 'system' as const,
        content: 'IMPORTANT: This user may be in crisis. Be extra supportive and gently encourage seeking immediate help from a counselor, trusted person, or emergency services. Still provide emotional support but prioritize safety.'
      });
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 500,
      stream: true,
    });

    // Convert the response to a ReadableStream to avoid type issues
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        // @ts-ignore - We'll handle the stream manually to avoid type conflicts
        for await (const chunk of response) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    // Create streaming response using the custom stream
    return new StreamingTextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}