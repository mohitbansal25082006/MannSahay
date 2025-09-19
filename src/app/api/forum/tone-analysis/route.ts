import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { text, language = 'en' } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const prompt = `Analyze the tone of the following text written in ${language}. Provide your response in JSON format with the following structure:
{
  "overallTone": "overall tone assessment (e.g., positive, negative, neutral, anxious, angry)",
  "emotions": ["list of detected emotions"],
  "respectfulness": "assessment of how respectful the tone is (e.g., very respectful, neutral, disrespectful)",
  "suggestions": ["list of suggestions to improve tone if needed"]
}

Text: "${text}"

Tone Analysis:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const toneAnalysis = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return NextResponse.json(toneAnalysis);
  } catch (error) {
    console.error('Tone analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze tone' }, { status: 500 });
  }
}