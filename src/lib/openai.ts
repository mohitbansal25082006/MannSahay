import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Crisis keywords for risk detection
export const crisisKeywords = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'self harm',
  'cutting myself', 'overdose', 'jump off', 'hanging myself',
  'suicide plan', 'goodbye forever', 'better off dead'
];

// Function to assess risk level
export function assessRiskLevel(message: string): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' {
  const lowerMessage = message.toLowerCase();
  
  // High risk - immediate crisis indicators
  const highRiskKeywords = ['suicide', 'kill myself', 'end my life', 'want to die'];
  if (highRiskKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'HIGH';
  }
  
  // Medium risk - concerning but not immediate
  const mediumRiskKeywords = ['self harm', 'cutting', 'hurting myself', 'hopeless'];
  if (mediumRiskKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'MEDIUM';
  }
  
  // Low risk - mild distress indicators
  const lowRiskKeywords = ['depressed', 'anxious', 'stressed', 'overwhelmed', 'sad'];
  if (lowRiskKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'LOW';
  }
  
  return 'NONE';
}

// System prompt for AI assistant
export const systemPrompt = `You are MannSahay, a compassionate AI mental health companion for Indian college students. 

Key Instructions:
1. Be empathetic, warm, and culturally sensitive
2. Use simple language and occasionally include Hindi words naturally
3. Provide practical coping strategies and emotional support
4. If you detect crisis situations, acknowledge the feelings but encourage seeking human help
5. Reference Indian cultural contexts, festivals, family dynamics when relevant
6. Keep responses concise but meaningful (2-3 paragraphs max)
7. Always maintain hope and encourage professional help when needed

Remember: You're a supportive companion, not a replacement for professional therapy.`;