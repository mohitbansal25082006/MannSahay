// E:\mannsahay\src\app\api\ai\generate-reply\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, userName, userMessage, subject, urgency } = body;

    if (!userMessage) {
      return NextResponse.json(
        { error: 'User message is required' },
        { status: 400 }
      );
    }

    // Create system prompt for AI reply generation
    const systemPrompt = `You are a compassionate mental health support assistant for MannSahay, a platform for Indian students. Your task is to generate thoughtful, empathetic, and professional email replies to user inquiries.

IMPORTANT GUIDELINES:
1. Always maintain a warm, supportive, and professional tone
2. Acknowledge the user's concerns with empathy
3. Provide helpful information or resources when appropriate
4. Avoid making diagnoses or giving medical advice
5. Include crisis resources for urgent matters
6. Keep responses between 150-300 words
7. Use culturally appropriate language for Indian students
8. End with encouragement and next steps

USER CONTEXT:
- Platform: MannSahay (Mental health support for Indian students)
- User may be experiencing emotional distress
- Responses should be supportive but not therapeutic

Generate 2-3 different response variations with slightly different tones or focuses.`;

    // Create user prompt with message context
    const userPrompt = `
Generate email reply variations for the following user message:

USER: ${userName}
SUBJECT: ${subject}
URGENCY LEVEL: ${urgency}
MESSAGE:
${userMessage}

Please generate 2-3 professional reply variations. Each variation should:
1. Start with appropriate greeting
2. Acknowledge the user's message specifically
3. Provide supportive response
4. Include relevant resources if needed
5. End with warm closing and encouragement

Format your response as a JSON array of strings, where each string is a complete email reply.`;

    // Generate AI responses
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response generated from AI');
    }

    let suggestions: string[] = [];
    
    try {
      const parsedContent = JSON.parse(content);
      
      // Handle different possible response formats
      if (Array.isArray(parsedContent)) {
        suggestions = parsedContent;
      } else if (parsedContent.suggestions && Array.isArray(parsedContent.suggestions)) {
        suggestions = parsedContent.suggestions;
      } else if (parsedContent.replies && Array.isArray(parsedContent.replies)) {
        suggestions = parsedContent.replies;
      } else {
        // Fallback: extract any array from the response
        const arrays = Object.values(parsedContent).filter(val => Array.isArray(val));
        if (arrays.length > 0) {
          suggestions = arrays[0] as string[];
        }
      }
      
      // Ensure we have valid suggestions
      suggestions = suggestions
        .filter((suggestion): suggestion is string => typeof suggestion === 'string')
        .slice(0, 3); // Limit to 3 suggestions
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback: try to extract suggestions from raw text
      const lines = content.split('\n').filter(line => 
        line.trim().length > 50 && 
        !line.includes('```') &&
        !line.includes('{') &&
        !line.includes('}')
      );
      suggestions = lines.slice(0, 3);
    }

    // If no suggestions were extracted, create fallback suggestions
    if (suggestions.length === 0) {
      suggestions = [
        `Dear ${userName},\n\nThank you for reaching out to MannSahay and sharing your concerns regarding "${subject}". We appreciate you taking this important step for your mental well-being.\n\nOur team has reviewed your message, and we want to assure you that you're not alone in whatever you're experiencing. Many students face similar challenges, and it's courageous of you to seek support.\n\nWe'd like to offer you personalized assistance based on your specific situation. Our platform provides various resources that might be helpful, including our AI chat companion, professional counseling sessions, and supportive community forum.\n\nPlease know that our team is here to support you. If you'd like to discuss this further or have any additional questions, don't hesitate to reach out.\n\nWarm regards,\nThe MannSahay Team`,
        
        `Hello ${userName},\n\nWe received your message about "${subject}" and want to thank you for contacting MannSahay. It takes strength to reach out when you're going through difficult times, and we're here to support you.\n\nBased on your message, we understand you're facing some challenges. We want you to know that what you're experiencing is valid, and many students encounter similar situations during their academic journey.\n\nOur platform offers several support options that might be beneficial for you:\n- 24/7 AI chat support for immediate assistance\n- Professional counseling sessions with qualified mental health professionals\n- Anonymous peer support forum\n- Curated mental health resources\n\nWe encourage you to explore these options and see what feels most comfortable for you. Remember, taking small steps towards self-care is an important achievement.\n\nBest regards,\nMannSahay Support Team`
      ];
    }

    return NextResponse.json({
      success: true,
      suggestions,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI reply generation error:', error);
    
    // Provide fallback suggestions in case of error
    const fallbackSuggestions = [
      "Thank you for reaching out to MannSahay. We appreciate you sharing your concerns with us. Our team is here to support you through whatever challenges you're facing. Please know that you're not alone, and many students experience similar difficulties. We encourage you to explore our resources and consider scheduling a session with one of our counselors for more personalized support.",
      
      "We received your message and want to thank you for contacting us. It takes courage to reach out for support, and we're glad you've taken this step. Our team is dedicated to helping Indian students navigate mental health challenges. We have various resources available that might be helpful for your situation. Please don't hesitate to share more details if you're comfortable, so we can provide better assistance."
    ];
    
    return NextResponse.json({
      success: false,
      suggestions: fallbackSuggestions,
      error: 'AI generation failed, using fallback responses',
      generatedAt: new Date().toISOString(),
    });
  }
}