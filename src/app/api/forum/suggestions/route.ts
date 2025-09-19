import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { text, language = 'en' } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const prompt = `Analyze the following text written in ${language} and provide suggestions to improve clarity, grammar, and tone. Provide your response in JSON format with the following structure:
{
  "grammar": ["list of grammar corrections"],
  "clarity": ["list of clarity improvements"],
  "tone": ["list of tone adjustments"],
  "suggestedText": "improved version of the text"
}

Text: "${text}"

Suggestions:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const suggestions = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Writing suggestions error:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}