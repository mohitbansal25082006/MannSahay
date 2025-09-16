import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { transcribeAudio } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const audio = formData.get('audio') as Blob;
    const language = formData.get('language') as 'en' | 'hi';

    if (!audio) {
      return new Response('Audio file is required', { status: 400 });
    }

    // Transcribe audio using Whisper
    const transcription = await transcribeAudio(audio, language);

    return new Response(JSON.stringify({ text: transcription }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Audio transcription error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}