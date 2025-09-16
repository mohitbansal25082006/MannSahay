import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { generateSpeech } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { text, language } = await request.json();

    if (!text) {
      return new Response('Text is required', { status: 400 });
    }

    // Generate speech using TTS
    const audioBuffer = await generateSpeech(text, language);

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="speech.mp3"',
      },
    });

  } catch (error) {
    console.error('Speech generation error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}