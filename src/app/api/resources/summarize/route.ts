// E:\mannsahay\src\app\api\resources\summarize\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { text, type } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    // Create prompt based on content type
    let prompt = '';
    
    switch (type) {
      case 'ARTICLE':
        prompt = `Summarize the following article in 3-5 bullet points, focusing on the key takeaways and main ideas:\n\n${text}`;
        break;
      case 'VIDEO':
        prompt = `Summarize the key points from this video transcript in 3-5 bullet points:\n\n${text}`;
        break;
      case 'AUDIO':
        prompt = `Summarize the main insights from this audio content in 3-5 bullet points:\n\n${text}`;
        break;
      case 'PDF':
        prompt = `Extract and summarize the key information from this document in 3-5 bullet points:\n\n${text}`;
        break;
      default:
        prompt = `Summarize the following content in 3-5 bullet points:\n\n${text}`;
    }
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at summarizing mental health and wellness content. Create concise, informative summaries that capture the essence of the content.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });
    
    const summary = response.choices[0]?.message?.content || '';
    
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error summarizing text:', error);
    return NextResponse.json(
      { error: 'Failed to summarize text' },
      { status: 500 }
    );
  }
}