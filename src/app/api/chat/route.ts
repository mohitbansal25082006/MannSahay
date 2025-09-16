import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { openai, assessRiskLevel, systemPrompt } from '@/lib/openai';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('Chat API called');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user?.email) {
      console.log('Unauthorized: No session or email');
      return new Response('Unauthorized', { status: 401 });
    }

    // Get user from database to ensure they exist
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.log('User not found in database');
      return new Response('User not found', { status: 404 });
    }

    // Parse the request body
    const body = await request.json();
    console.log('Request body:', body);
    
    const { messages: chatMessages, language = 'en' } = body;
    
    // Extract the latest message from the messages array
    const latestMessage = chatMessages?.[chatMessages.length - 1]?.content;
    console.log('Latest message:', latestMessage);

    if (!latestMessage || typeof latestMessage !== 'string') {
      console.log('Invalid message format:', latestMessage);
      return new Response('Message is required', { status: 400 });
    }

    // Assess risk level
    const riskLevel = assessRiskLevel(latestMessage);
    console.log('Risk level assessed:', riskLevel);

    // Save user message to database
    await prisma.chat.create({
      data: {
        userId: user.id,
        content: latestMessage,
        role: 'user',
        language,
        riskLevel: riskLevel as any
      }
    });

    // Get recent chat history for context
    const recentChats = await prisma.chat.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    // Build conversation history for OpenAI
    const openaiMessages = [
      {
        role: 'system' as const,
        content: `${systemPrompt}\n\nUser's preferred language: ${language === 'hi' ? 'Hindi' : 'English'}. Respond in the same language as the user's message.`
      },
      ...recentChats.reverse().map(chat => ({
        role: chat.role as 'user' | 'assistant',
        content: chat.content
      }))
    ];

    // Add crisis response if high risk
    if (riskLevel === 'HIGH') {
      openaiMessages.unshift({
        role: 'system' as const,
        content: 'CRISIS ALERT: User may be in immediate danger. Be extremely supportive, validate their feelings, and strongly encourage contacting emergency services (108/112), a trusted person, or crisis helpline immediately while still providing emotional support.'
      });
    }

    console.log('Sending to OpenAI:', openaiMessages);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 500,
      stream: true,
    });

    // Create a custom ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullResponse = '';

        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              controller.enqueue(encoder.encode(content));
            }
          }

          // Save AI response to database after stream completes
          if (fullResponse.trim()) {
            await prisma.chat.create({
              data: {
                userId: user.id,
                content: fullResponse,
                role: 'assistant',
                language,
                riskLevel: riskLevel as any
              }
            });
          }

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}