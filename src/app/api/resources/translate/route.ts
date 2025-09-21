// E:\mannsahay\src\app\api\resources\translate\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { title, description, content, summary, targetLanguage } = await request.json();
    
    if (!title || !targetLanguage) {
      return NextResponse.json(
        { error: 'Title and target language are required' },
        { status: 400 }
      );
    }
    
    // Map language codes to full names
    const languageNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      ta: 'Tamil',
      bn: 'Bengali',
      te: 'Telugu',
      mr: 'Marathi',
      gu: 'Gujarati',
      kn: 'Kannada',
      ml: 'Malayalam',
      pa: 'Punjabi',
    };
    
    const targetLanguageName = languageNames[targetLanguage] || targetLanguage;
    
    const prompt = `Translate the following mental health resource content to ${targetLanguageName}. 

IMPORTANT INSTRUCTIONS:
1. Maintain the original meaning, tone, and context
2. Keep all technical mental health terms accurate
3. Preserve any cultural references and adapt them appropriately
4. Ensure the translation is empathetic and supportive in tone
5. Format the response as a JSON object with the following structure:
{
  "translatedTitle": "translated title here",
  "translatedDescription": "translated description here",
  "translatedContent": "translated content here",
  "translatedSummary": "translated summary here"
}

Content to translate:
Title: ${title}
Description: ${description || ''}
Content: ${content || ''}
Summary: ${summary || ''}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in mental health content. Translate accurately while maintaining the original meaning, tone, and cultural context.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });
    
    const responseText = response.choices[0]?.message?.content || '{}';
    const translations = JSON.parse(responseText);
    
    return NextResponse.json(translations);
  } catch (error) {
    console.error('Error translating text:', error);
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
}