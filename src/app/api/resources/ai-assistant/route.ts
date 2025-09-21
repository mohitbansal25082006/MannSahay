// E:\mannsahay\src\app\api\resources\ai-assistant\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { question, resourceId, resourceTitle, resourceContent, conversationHistory } = await request.json();

    if (!question || !resourceId) {
      return NextResponse.json(
        { error: 'Question and resource ID are required' },
        { status: 400 }
      );
    }

    // Create a system prompt for the AI assistant
    const systemPrompt = `You are an AI assistant for a mental health resource platform called MannSahay. Your role is to help users understand and engage with mental health resources.

Resource Context:
- Title: ${resourceTitle}
- Content: ${resourceContent || 'No content available'}
- Resource ID: ${resourceId}

Your Guidelines:
1. Be empathetic, supportive, and informative
2. Provide accurate information about mental health topics
3. Keep responses concise but helpful
4. If you don't know something, be honest about it
5. Never provide medical advice or diagnose conditions
6. Encourage users to seek professional help for serious concerns
7. Adapt your tone to be warm and approachable
8. Use simple language that's easy to understand

Conversation History:
${conversationHistory ? conversationHistory.map((msg: any) => 
  `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
).join('\n') : 'No previous conversation'}

Current Question: ${question}

Please provide a helpful response to the user's question about this resource.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = response.choices[0]?.message?.content || 
      "I'm sorry, I'm having trouble responding right now. Please try again later.";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error in AI assistant:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `AI Assistant Error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}