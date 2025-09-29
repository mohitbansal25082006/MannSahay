import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { assessRiskLevel, analyzeMessageContext, generateContextualResponse } from '@/lib/openai';
import { prisma } from '@/lib/db';

// Define RiskLevel enum for typing riskLevel
enum RiskLevel {
  NONE = 'NONE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export async function POST(request: NextRequest) {
  try {
    console.log('Enhanced Multilingual Chat API called');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user?.email) {
      console.log('Unauthorized: No session or email');
      return new Response('Unauthorized', { status: 401 });
    }

    // Get user from database
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
    
    const { messages: chatMessages, language = 'en', sessionId } = body;
    
    // Extract the latest message from the messages array
    const latestMessage = chatMessages?.[chatMessages.length - 1]?.content;
    console.log('Latest message:', latestMessage);

    if (!latestMessage || typeof latestMessage !== 'string') {
      console.log('Invalid message format:', latestMessage);
      return new Response('Message is required', { status: 400 });
    }

    // Analyze message context and assess risk
    const messageContext = analyzeMessageContext(latestMessage);
    const riskLevel: RiskLevel = assessRiskLevel(latestMessage) as RiskLevel;
    console.log('Message analysis:', { messageContext, riskLevel });

    // Handle session management
    let currentSessionId = sessionId;
    
    if (!currentSessionId) {
      // Create new session if none exists
      const activeSession = await prisma.chatSession.findFirst({
        where: { 
          userId: user.id,
          isActive: true
        }
      });

      if (!activeSession) {
        // Generate title from first message (truncated)
        const autoTitle = latestMessage.length > 50 
          ? latestMessage.substring(0, 47) + '...'
          : latestMessage;

        const newSession = await prisma.chatSession.create({
          data: {
            userId: user.id,
            title: autoTitle,
            language,
            isActive: true,
            riskLevel
          }
        });
        currentSessionId = newSession.id;
      } else {
        currentSessionId = activeSession.id;
      }
    }

    // Save user message to database
    await prisma.chat.create({
      data: {
        userId: user.id,
        sessionId: currentSessionId,
        content: latestMessage,
        role: 'user',
        language,
        riskLevel,
        context: messageContext
      }
    });

    // Get recent chat history from current session for context
    const recentChats = await prisma.chat.findMany({
      where: { 
        sessionId: currentSessionId,
        userId: user.id 
      },
      orderBy: { timestamp: 'desc' },
      take: 20 // Get more context for better responses
    });

    // Build conversation history for OpenAI
    const conversationHistory = recentChats
      .reverse()
      .slice(-10) // Keep last 10 messages for context
      .map(chat => ({
        role: chat.role,
        content: chat.content
      }));

    // Generate contextual response using enhanced OpenAI function
    let aiResponse: string;
    
    try {
      const aiResult = await generateContextualResponse(
        latestMessage, 
        language as 'en' | 'hi' | 'dog' | 'mr' | 'ta', // Add the language parameter
        conversationHistory as Array<{role: string, content: string}>,
        {
          name: user.name || undefined,
          previousSessions: undefined, // You might want to calculate this
          riskLevel: riskLevel,
          preferences: { language }
        }
      );
      aiResponse = aiResult.response;
    } catch (error) {
      console.error('OpenAI generation error:', error);
      // Fallback response based on language
      const fallbackResponses = {
        en: 'I understand you\'re reaching out. Please tell me how I can help you today.',
        hi: 'मैं समझ रहा हूं कि आप कुछ कहना चाहते हैं। कृपया मुझे बताएं कि मैं आपकी कैसे मदद कर सकता हूं?',
        dog: 'ਮੈਂ ਸਮਝਦਾ ਹਾਂ ਕਿ ਤੁਸੀਂ ਕੁਝ ਕਹਿਣਾ ਚਾਹੁੰਦੇ ਹੋ। ਕਿਰਪਾ ਕਰਕੇ ਮੈਨੂੰ ਦੱਸੋ ਕਿ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
        mr: 'मला समजते आहे की तुम्हाला काही सांगायचे आहे. कृपया मला सांगा की मी तुमची कशी मदत करू शकतो.',
        ta: 'நான் புரிந்துகொள்கிறேன் நீங்கள் ஏதாவது சொல்ல விரும்புகிறீர்கள் என்று. தயவு செய்து எனக்குச் சொல்லுங்கள், நான் உங்களுக்கு எப்படி உதவ முடியும் என்று.'
      };
      aiResponse = fallbackResponses[language as keyof typeof fallbackResponses] || fallbackResponses.en;
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          // Stream the response word by word for better UX
          const words = aiResponse.split(' ');
          
          for (let i = 0; i < words.length; i++) {
            const chunk = i === 0 ? words[i] : ' ' + words[i];
            controller.enqueue(encoder.encode(chunk));
            
            // Add slight delay for realistic typing effect
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          // Save AI response to database after streaming
          await prisma.chat.create({
            data: {
              userId: user.id,
              sessionId: currentSessionId,
              content: aiResponse,
              role: 'assistant',
              language,
              riskLevel,
              context: messageContext
            }
          });

          // Update session metadata
          await prisma.chatSession.update({
            where: { id: currentSessionId },
            data: {
              lastMessageAt: new Date(),
              totalMessages: {
                increment: 2 // User message + AI response
              },
              riskLevel: riskLevel === RiskLevel.HIGH ? RiskLevel.HIGH : 
                        riskLevel === RiskLevel.MEDIUM ? RiskLevel.MEDIUM : 
                        undefined // Only update if higher risk
            }
          });

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
        'X-Session-Id': currentSessionId, // Return session ID in header
      },
    });

  } catch (error) {
    console.error('Enhanced Multilingual Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// GET: Retrieve chat history for a specific session
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!sessionId) {
      return new Response('Session ID is required', { status: 400 });
    }

    // Verify user owns this session
    const chatSession = await prisma.chatSession.findFirst({
      where: { 
        id: sessionId,
        userId: user.id
      }
    });

    if (!chatSession) {
      return new Response('Chat session not found', { status: 404 });
    }

    // Get chat messages for the session
    const chats = await prisma.chat.findMany({
      where: { 
        sessionId: sessionId,
        userId: user.id 
      },
      orderBy: { timestamp: 'asc' },
      skip: offset,
      take: limit
    });

    return new Response(JSON.stringify({ 
      chats,
      session: chatSession,
      hasMore: chats.length === limit
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chat history GET error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}