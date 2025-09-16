import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Crisis keywords for risk detection
export const crisisKeywords = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'self harm',
  'cutting myself', 'overdose', 'jump off', 'hanging myself',
  'suicide plan', 'goodbye forever', 'better off dead',
  // Hindi crisis keywords
  'आत्महत्या', 'खुदकुशी', 'मर जाऊं', 'जान दे दूं', 'खत्म कर दूं',
  'सब खत्म', 'अब नहीं रह सकता', 'थक गया हूं'
];

// Function to assess risk level
export function assessRiskLevel(message: string): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' {
  const lowerMessage = message.toLowerCase();
  
  // High risk - immediate crisis indicators
  const highRiskKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die', 'आत्महत्या',
    'खुदकुशी', 'मर जाऊं', 'जान दे दूं'
  ];
  if (highRiskKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'HIGH';
  }
  
  // Medium risk - concerning but not immediate
  const mediumRiskKeywords = [
    'self harm', 'cutting', 'hurting myself', 'hopeless', 'खुद को नुकसान',
    'काटना', 'निराश', 'उम्मीद नहीं'
  ];
  if (mediumRiskKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'MEDIUM';
  }
  
  // Low risk - mild distress indicators
  const lowRiskKeywords = [
    'depressed', 'anxious', 'stressed', 'overwhelmed', 'sad',
    'उदास', 'चिंतित', 'तनाव', 'अभिभूत', 'दुखी'
  ];
  if (lowRiskKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'LOW';
  }
  
  return 'NONE';
}

// System prompt for AI assistant
export const systemPrompt = `You are MannSahay, a compassionate AI mental health companion for Indian college students. 

Key Instructions:
1. Be empathetic, warm, and culturally sensitive
2. Use simple language and occasionally include Hindi words naturally when appropriate
3. Provide practical coping strategies and emotional support
4. If you detect crisis situations, acknowledge the feelings but encourage seeking human help
5. Reference Indian cultural contexts, festivals, family dynamics when relevant
6. Keep responses concise but meaningful (2-3 paragraphs max)
7. Always maintain hope and encourage professional help when needed
8. Respond in the same language as the user's message (English or Hindi)

Remember: You're a supportive companion, not a replacement for professional therapy.`;

// Function to transcribe audio using Whisper
export async function transcribeAudio(audioBlob: Blob, language: 'en' | 'hi' = 'en'): Promise<string> {
  try {
    // Convert Blob to File-like object
    const formData = new FormData();
    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('response_format', 'json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Whisper API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

// Function to generate speech using TTS
export async function generateSpeech(text: string, language: 'en' | 'hi' = 'en'): Promise<ArrayBuffer> {
  try {
    const voice = language === 'hi' ? 'shimmer' : 'alloy'; // Different voices for different languages
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: voice,
        input: text,
        response_format: 'mp3',
        speed: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Speech generation error:', error);
    throw error;
  }
}