import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage = 'auto' } = await request.json();
    
    if (!text || !targetLanguage) {
      return NextResponse.json({ error: 'Text and target language are required' }, { status: 400 });
    }

    const prompt = `Translate the following text to ${targetLanguage}. If the source language is not specified, detect it automatically. Provide only the translation without any additional text or explanations.

Text: "${text}"

Translation:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const translation = response.choices[0]?.message?.content?.trim() || '';
    
    return NextResponse.json({ 
      translation,
      sourceLanguage,
      targetLanguage 
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Failed to translate text' }, { status: 500 });
  }
}