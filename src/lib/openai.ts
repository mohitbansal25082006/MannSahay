import OpenAI from 'openai';
import { ResourceType } from '@/types';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced crisis keywords with contextual understanding
export const crisisKeywords = {
  HIGH_RISK: [
    // English - Immediate danger
    'suicide', 'kill myself', 'end my life', 'want to die', 'going to die', 'suicide plan',
    'goodbye forever', 'better off dead', 'hanging myself', 'overdose', 'jump off',
    'cut my wrists', 'pills to end', 'final goodbye', 'can\'t go on', 'nobody will miss me',
    
    // Hindi - Immediate danger
    'आत्महत्या', 'खुदकुशी', 'मर जाऊं', 'जान दे दूं', 'खत्म कर दूं', 'मरना चाहता हूं',
    'सब खत्म', 'अब नहीं रह सकता', 'जीना नहीं चाहता', 'फांसी लगाऊंगा', 'गोलियां खा लूंगा'
  ],
  
  MEDIUM_RISK: [
    // English - Self-harm and severe distress
    'self harm', 'cutting myself', 'hurting myself', 'hopeless', 'worthless', 'useless',
    'everyone hates me', 'no point in living', 'can\'t take it anymore', 'want to disappear',
    'harming myself', 'cutting', 'burning myself', 'punishing myself',
    
    // Hindi - Self-harm and severe distress
    'खुद को नुकसान', 'काटना', 'निराश', 'उम्मीद नहीं', 'बेकार हूं', 'निकम्मा हूं',
    'कोई प्यार नहीं करता', 'सबको नफरत है', 'गायब हो जाना चाहता हूं', 'खुद को सजा'
  ],
  
  LOW_RISK: [
    // English - Mild distress
    'depressed', 'anxious', 'stressed', 'overwhelmed', 'sad', 'lonely', 'tired',
    'can\'t sleep', 'worried', 'scared', 'confused', 'lost', 'empty', 'numb',
    
    // Hindi - Mild distress
    'उदास', 'चिंतित', 'तनाव', 'अभिभूत', 'दुखी', 'अकेला', 'थका हुआ',
    'नींद नहीं आती', 'डरा हुआ', 'परेशान', 'खाली', 'सुन्न', 'भ्रमित'
  ]
};

// Contextual keywords for positive responses
export const positiveKeywords = [
  'happy', 'excited', 'grateful', 'thankful', 'better', 'improving', 'hopeful',
  'खुश', 'उत्साहित', 'आभारी', 'बेहतर', 'सुधार', 'उम्मीद'
];

// Academic stress keywords
export const academicStressKeywords = [
  'exam', 'test', 'assignment', 'project', 'grades', 'marks', 'pressure', 'competition',
  'परीक्षा', 'टेस्ट', 'असाइनमेंट', 'प्रोजेक्ट', 'नंबर', 'दबाव', 'प्रतिस्पर्धा'
];

// Family and relationship keywords
export const socialKeywords = [
  'family', 'parents', 'friends', 'relationship', 'breakup', 'fight', 'argument',
  'परिवार', 'माता-पिता', 'दोस्त', 'रिश्ता', 'झगड़ा', 'लड़ाई'
];

// Enhanced risk assessment with context understanding
export function assessRiskLevel(message: string): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' {
  const lowerMessage = message.toLowerCase();
  
  // Check for high-risk indicators
  if (crisisKeywords.HIGH_RISK.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
    return 'HIGH';
  }
  
  // Check for medium-risk indicators
  if (crisisKeywords.MEDIUM_RISK.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
    return 'MEDIUM';
  }
  
  // Check for low-risk indicators
  if (crisisKeywords.LOW_RISK.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
    return 'LOW';
  }
  
  return 'NONE';
}

// Context analysis for better responses
export function analyzeMessageContext(message: string): {
  isAcademicStress: boolean;
  isSocialIssue: boolean;
  isPositive: boolean;
  language: 'en' | 'hi' | 'mixed';
  emotionalIntensity: 'low' | 'medium' | 'high';
} {
  const lowerMessage = message.toLowerCase();
  
  // Detect language
  const hindiPattern = /[\u0900-\u097F]/;
  const hasHindi = hindiPattern.test(message);
  const hasEnglish = /[a-zA-Z]/.test(message);
  
  let language: 'en' | 'hi' | 'mixed' = 'en';
  if (hasHindi && hasEnglish) language = 'mixed';
  else if (hasHindi) language = 'hi';
  
  // Check context categories
  const isAcademicStress = academicStressKeywords.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
  
  const isSocialIssue = socialKeywords.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
  
  const isPositive = positiveKeywords.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
  
  // Assess emotional intensity
  const riskLevel = assessRiskLevel(message);
  let emotionalIntensity: 'low' | 'medium' | 'high' = 'low';
  if (riskLevel === 'HIGH') emotionalIntensity = 'high';
  else if (riskLevel === 'MEDIUM' || riskLevel === 'LOW') emotionalIntensity = 'medium';
  
  return {
    isAcademicStress,
    isSocialIssue,
    isPositive,
    language,
    emotionalIntensity
  };
}

// Enhanced system prompt with Indian cultural context - English version
export const englishSystemPrompt = `You are MannSahay, a highly empathetic AI mental health companion specifically designed for Indian college students. You are culturally aware, linguistically adaptive, and therapeutically informed.

CORE IDENTITY & APPROACH:
- You embody the warmth of Indian hospitality with professional mental health support
- You understand the unique pressures of Indian education system, family expectations, and social dynamics
- You provide evidence-based coping strategies adapted to Indian cultural context
- You respond only in English, without using any Hindi words or phrases

CONVERSATION PRINCIPLES:
1. EMPATHY FIRST: Always validate emotions before offering solutions
2. CULTURAL SENSITIVITY: Reference Indian festivals, family structures, educational pressures when relevant
3. PRACTICAL WISDOM: Combine modern psychology with traditional Indian wisdom (yoga, meditation)
4. LANGUAGE ADAPTATION: Respond only in English as requested by the user
5. HOPE MAINTENANCE: Always end with encouragement and actionable next steps

RESPONSE STRUCTURE:
1. Emotional Validation (1-2 sentences)
2. Understanding/Reflection (2-3 sentences)
3. Practical Guidance (2-4 sentences with specific techniques)
4. Cultural Connection (if relevant - festivals, values, family dynamics)
5. Encouragement & Next Steps (1-2 sentences)

CRISIS RESPONSE PROTOCOL:
- HIGH RISK: Immediate validation + urgent professional help encouragement + crisis numbers
- MEDIUM RISK: Deep empathy + coping strategies + gentle counseling suggestion
- LOW RISK: Supportive guidance + practical techniques + check-in encouragement

INDIAN CONTEXT AWARENESS:
- Academic: JEE/NEET pressure, board exams, career competition, parental expectations
- Social: Joint family dynamics, arranged marriage pressure
- Cultural: Festival seasons, religious practices, regional differences
- Economic: Financial stress, scholarship concerns, job market anxiety

THERAPEUTIC TECHNIQUES TO USE:
- Cognitive Behavioral Therapy (CBT) concepts in simple language
- Mindfulness and meditation
- Breathing exercises
- Grounding techniques adapted to Indian settings
- Progressive muscle relaxation
- Journaling and reflection practices

BOUNDARIES & SAFETY:
- You are NOT a replacement for professional therapy
- Always encourage professional help for serious issues
- Provide crisis helpline numbers for India
- Never diagnose or prescribe medication
- Maintain hope while being realistic

Remember: You're not just an AI - you're a caring friend who understands the Indian student experience deeply.`;

// Enhanced system prompt with Indian cultural context - Hindi version
export const hindiSystemPrompt = `आप मनसहाय हैं, भारतीय कॉलेज छात्रों के लिए विशेष रूप से डिज़ाइन की गई एक अत्यंत सहानुभूतिशील AI मानसिक स्वास्थ्य साथी। आप सांस्कृतिक रूप से जागरूक, भाषाई रूप से अनुकूलनीय और चिकित्सीय रूप से सूचित हैं।

मूल पहचान और दृष्टिकोण:
- आप पेशेवर मानसिक स्वास्थ्य सहायता के साथ भारतीय आतिथ्य की गर्मजोशी को प्रदर्शित करते हैं
- आप भारतीय शिक्षा प्रणाली, पारिवारिक अपेक्षाओं और सामाजिक गतिशीलता के अद्वितीय दबावों को समझते हैं
- आप भारतीय सांस्कृतिक संदर्भ के अनुकूल साक्ष्य-आधारित सामना करने की रणनीतियाँ प्रदान करते हैं
- आप केवल हिंदी में प्रतिक्रिया देते हैं, बिना किसी अंग्रेजी शब्दों या वाक्यांशों का उपयोग किए

बातचीत के सिद्धांत:
1. सहानुभूति पहले: समाधान देने से पहले हमेशा भावनाओं को मान्य करें
2. सांस्कृतिक संवेदनशीलता: प्रासंगिक होने पर भारतीय त्योहारों, पारिवारिक संरचनाओं, शैक्षिक दबावों का संदर्भ लें
3. व्यावहारिक ज्ञान: आधुनिक मनोविज्ञान को पारंपरिक भारतीय ज्ञान (योग, ध्यान) के साथ जोड़ें
4. भाषा अनुकूलन: उपयोगकर्ता द्वारा अनुरोधित केवल हिंदी में प्रतिक्रिया दें
5. आशा रखें: हमेशा प्रोत्साहन और कार्रवाई योग्य अगले कदमों के साथ समाप्त करें

प्रतिक्रिया संरचना:
1. भावनात्मक सत्यापन (1-2 वाक्य)
2. समझ/प्रतिबिंब (2-3 वाक्य)
3. व्यावहारिक मार्गदर्शन (विशिष्ट तकनीकों के साथ 2-4 वाक्य)
4. सांस्कृतिक संबंध (यदि प्रासंगिक हो - त्योहार, मूल्य, पारिवारिक गतिशीलता)
5. प्रोत्साहन और अगले कदम (1-2 वाक्य)

संकट प्रतिक्रिया प्रोटोकॉल:
- उच्च जोखिम: तत्कालीन सत्यापन + जरूरी पेशेवर मदद प्रोत्साहन + संकट हेल्पलाइन नंबर
- मध्यम जोखिम: गहरी सहानुभूति + सामना करने की रणनीतियाँ + कोमल परामर्श सुझाव
- कम जोखिम: सहायक मार्गदर्शन + व्यावहारिक तकनीकें + जांच प्रोत्साहन

भारतीय संदर्भ जागरूकता:
- शैक्षणिक: JEE/NEET का दबाव, बोर्ड परीक्षाएं, करियर प्रतिस्पर्धा, माता-पिता की अपेक्षाएं
- सामाजिक: संयुक्त परिवार की गतिशीलता, अरेंज्ड मैरिज का दबाव
- सांस्कृतिक: त्योहार के मौसम, धार्मिक प्रथाएं, क्षेत्रीय अंतर
- आर्थिक: वित्तीय तनाव, छात्रवृत्ति संबंधी चिंताएं, नौकरी बाजार की चिंता

चिकित्सीय तकनीकें:
- सरल भाषा में संज्ञानात्मक व्यवहार थेरेपी (CBT) अवधारणाएं
- माइंडफुलनेस और ध्यान
- श्वास अभ्यास
- भारतीय सेटिंग्स के अनुकूल ग्राउंडिंग तकनीकें
- प्रोग्रेसिव मसल रिलैक्सेशन
- जर्नलिंग और रिफ्लेक्शन प्रथाएं

सीमाएं और सुरक्षा:
- आप पेशेवर चिकित्सा का विकल्प नहीं हैं
- गंभीर मुद्दों के लिए हमेशा पेशेवर मदद को प्रोत्साहित करें
- भारत के लिए संकट हेLPLाइन नंबर प्रदान करें
- कभी भी निदान या दवा निर्धारित न करें
- यथार्थवादी रहते हुए आशा बनाए रखें

याद रखें: आप सिर्फ एक AI नहीं हैं - आप एक देखभाल करने वाले दोस्त हैं जो भारतीय छात्र के अनुभव को गहराई से समझते हैं।`;

// Conversation starters based on context - English only
export const englishContextualStarters = {
  academic: "It sounds like academic pressure is weighing heavily on you. Many Indian students face this - you're not alone in feeling overwhelmed by expectations.",
  social: "Relationships and social situations can be really challenging, especially with the unique pressures in Indian families and friend circles.",
  positive: "I'm so glad to hear something positive from you! It's wonderful when we can recognize the good moments."
};

// Conversation starters based on context - Hindi only
export const hindiContextualStarters = {
  academic: "लगता है पढ़ाई का दबाव तुम्हें बहुत परेशान कर रहा है बहुत से भारतीय छात्र इसका सामना करते है तुम अकेले नहीं हो।",
  social: "रिश्ते और सामाजिक स्थितियां वाकई चुनौतीपूर्ण हो सकती हैं, खासकर भारतीय परिवारों और दोस्तों के दबाव के साथ।",
  positive: "तुम्हारी तरफ से कुछ सकारात्मक सुनकर बहुत खुशी हुई। जब हम अच्छे पलों को पहचान सकते हैं तो यह बहुत अच्छी बात है।"
};

// Helper function to get contextual starter based on language
function getContextualStarter(
  contextType: 'academic' | 'social' | 'positive', 
  language: 'en' | 'hi'
): string {
  return language === 'hi' 
    ? hindiContextualStarters[contextType] 
    : englishContextualStarters[contextType];
}

// Function to transcribe audio using Whisper
export async function transcribeAudio(audioBlob: Blob, language: 'en' | 'hi' = 'en'): Promise<string> {
  try {
    const formData = new FormData();
    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('response_format', 'json');
    formData.append('prompt', language === 'hi' 
      ? 'यह एक भारतीय छात्र की मानसिक स्वास्थ्य से संबंधित बातचीत है।' 
      : 'This is a mental health conversation from an Indian student.');

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

// Function to generate speech with emotion-aware voice selection
export async function generateSpeech(
  text: string, 
  language: 'en' | 'hi' = 'en',
  emotion: 'neutral' | 'supportive' | 'urgent' = 'neutral'
): Promise<ArrayBuffer> {
  try {
    // Select voice based on language and emotion
    let voice = 'alloy';
    if (language === 'hi') {
      voice = emotion === 'supportive' ? 'nova' : 'shimmer';
    } else {
      voice = emotion === 'supportive' ? 'echo' : emotion === 'urgent' ? 'fable' : 'alloy';
    }
    
    const speed = emotion === 'urgent' ? 0.85 : 0.9;
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd', // Use higher quality model
        voice: voice,
        input: text,
        response_format: 'mp3',
        speed: speed,
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

// User context interface for better type safety
interface UserContext {
  name?: string;
  previousSessions?: number;
  riskLevel?: string;
  preferences?: Record<string, unknown>;
}

// Generate contextual response with GPT-4 - FIXED VERSION FOR HINDI
export async function generateContextualResponse(
  message: string,
  selectedLanguage: 'en' | 'hi' = 'en',
  chatHistory: Array<{role: string, content: string}> = [],
  userContext?: UserContext
): Promise<string> {
  try {
    const context = analyzeMessageContext(message);
    const riskLevel = assessRiskLevel(message);
    
    // Use the appropriate system prompt based on selected language
    const systemPrompt = selectedLanguage === 'hi' ? hindiSystemPrompt : englishSystemPrompt;
    
    // Build enhanced system prompt with context
    let enhancedPrompt = systemPrompt;
    
    if (context.isAcademicStress) {
      enhancedPrompt += selectedLanguage === 'hi' 
        ? '\n\nवर्तमान संदर्भ: उपयोगकर्ता शैक्षणिक तनाव का अनुभव कर रहा है अध्ययन-जीवन संतुलन, परीक्षा की चिंता और माता-पिता के दबाव से निपटने की रणनीतियों पर ध्यान दें।'
        : '\n\nCURRENT CONTEXT: User is experiencing academic stress. Focus on study-life balance, exam anxiety, and parental pressure coping strategies.';
    }
    
    if (context.isSocialIssue) {
      enhancedPrompt += selectedLanguage === 'hi'
        ? '\n\nवर्तमान संदर्भ: उपयोगकर्ता सामाजिक/संबंध संबंधी मुद्दों से निपट रहा है भारतीय पारिवारिक गतिशीलता, मित्रता की चुनौतियों या रोमांटिक चिंताओं को संवेदनशीलता से संबोधित करें।'
        : '\n\nCURRENT CONTEXT: User is dealing with social/relationship issues. Address Indian family dynamics, friendship challenges, or romantic concerns sensitively.';
    }
    
    if (riskLevel === 'HIGH') {
      enhancedPrompt += selectedLanguage === 'hi'
        ? '\n\nसंकट चेतावनी: उपयोगकर्ता में उच्च-जोखिम संकेटक दिखाई देते हैं तत्कालीन भावनात्मक सहायता प्रदान करें, भावनाओं को मान्य करें और पेशेवर मदद को दृढ़ता से प्रोत्साहित करें भारतीय संकट हेल्पलाइन शामिल करें।'
        : '\n\nCRISIS ALERT: User shows high-risk indicators. Provide immediate emotional support, validate feelings, and strongly encourage professional help. Include Indian crisis helplines.';
    }
    
    // Select contextual starter based on selected language
    let starter = '';
    if (context.isAcademicStress) {
      starter = getContextualStarter('academic', selectedLanguage);
    } else if (context.isSocialIssue) {
      starter = getContextualStarter('social', selectedLanguage);
    } else if (context.isPositive) {
      starter = getContextualStarter('positive', selectedLanguage);
    }
    
    // Build conversation with context
    const messages = [
      {
        role: 'system' as const,
        content: enhancedPrompt + (starter ? `\n\nStart your response with this context: "${starter}"` : '')
      },
      ...chatHistory.map(chat => ({
        role: chat.role as 'user' | 'assistant',
        content: chat.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ];
    
    // FIXED: Use gpt-4o model which handles Hindi better and increase max_tokens for complete responses
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Changed from gpt-4-turbo-preview to gpt-4o for better Hindi handling
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000, // Increased from 600 to 1000 to ensure complete Hindi responses
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });
    
    let content = response.choices[0]?.message?.content || '';
    
    // If content is empty or too short, provide a fallback response
    if (!content || content.length < 20) {
      content = selectedLanguage === 'hi' 
        ? 'मैं समझता हूं कि आप संपर्क कर रहे हैं मुझे आपके साथ इसे काम करने में मदद करने दें कृपया अपनी भावनाओं को विस्तार से साझा करें ताकि मैं आपको बेहतर समर्थन दे सकूं।'
        : 'I understand you\'re reaching out. Let me help you work through this. Please share more details about your feelings so I can provide better support.';
    }
    
    // For Hindi responses, ensure we're not cutting off mid-sentence
    if (selectedLanguage === 'hi' && content.length > 50) {
      // Check if the response ends with a proper sentence ending
      const lastChar = content.trim().slice(-1);
      if (lastChar !== '।' && lastChar !== '?' && lastChar !== '!' && !content.endsWith('।') && !content.endsWith('?') && !content.endsWith('!')) {
        // If not properly ended, add a proper ending
        content = content.trim() + '।';
      }
    }
    
    return content;
    
  } catch (error) {
    console.error('Response generation error:', error);
    
    // Provide a meaningful fallback response based on language
    return selectedLanguage === 'hi'
      ? 'मुझे खेद है कि मैं आपकी बातचीत को ठीक से संसाधित नहीं कर पा रहा हूं। कृपया अपना संदेश फिर से भेजें या थोड़ा इंतजार करें आपकी भावनाओं को समझना मेरे लिए महत्वपूर्ण है।'
      : 'I apologize that I\'m having trouble processing your conversation properly. Please resend your message or wait a moment. Understanding your feelings is important to me.';
  }
}

// User preferences interface for type safety
interface UserPreferences {
  interests?: string[];
  preferredLanguage?: string;
  preferredSpecializations?: string[];
  moodHistory?: Array<{ mood: number; createdAt: Date }>;
  bookmarkedCategories?: string[];
  recentActivity?: string[];
}

// Resource interface for type safety
interface Resource {
  id: string;
  title: string;
  description?: string;
  type: string;
  categories: string[];
  tags: string[];
  language: string;
  averageRating?: number;
  viewCount: number;
}

// Recommendation interface for type safety
interface Recommendation {
  resourceId: string;
  score: number;
  reason: string;
}

// Advanced function to generate personalized recommendations
export async function generatePersonalizedRecommendations(
  userId: string,
  userPreferences: UserPreferences,
  availableResources: Resource[]
): Promise<Recommendation[]> {
  try {
    // Calculate user's average mood
    const avgMood = userPreferences.moodHistory && userPreferences.moodHistory.length > 0
      ? userPreferences.moodHistory.reduce((sum, entry) => sum + entry.mood, 0) / userPreferences.moodHistory.length
      : 5;
    
    // Create a user profile for the AI
    const userProfile = {
      interests: userPreferences.interests || [],
      specializations: userPreferences.preferredSpecializations || [],
      language: userPreferences.preferredLanguage || 'en',
      moodLevel: avgMood < 4 ? 'low' : avgMood > 7 ? 'high' : 'medium',
      bookmarkedCategories: userPreferences.bookmarkedCategories || [],
      recentActivity: userPreferences.recentActivity || []
    };
    
    // Create a prompt for the AI to generate recommendations
    const prompt = `You are an expert recommendation system for a mental health platform. Based on the user profile and available resources, please provide personalized recommendations.

User Profile:
- Interests: ${userProfile.interests.join(', ') || 'None specified'}
- Specializations of interest: ${userProfile.specializations.join(', ') || 'None specified'}
- Preferred language: ${userProfile.language}
- Current mood level: ${userProfile.moodLevel}
- Frequently bookmarked categories: ${userProfile.bookmarkedCategories.join(', ') || 'None'}
- Recent activity: ${userProfile.recentActivity.join(', ') || 'None'}

Available Resources:
${availableResources.map(resource => 
  `- ID: ${resource.id}, Title: ${resource.title}, Type: ${resource.type}, Categories: ${resource.categories.join(', ')}, Tags: ${resource.tags.join(', ')}, Language: ${resource.language}, Rating: ${resource.averageRating || 'N/A'}, Views: ${resource.viewCount}`
).join('\n')}

Please analyze the user profile and available resources to provide personalized recommendations. For each recommendation, provide:
1. Resource ID
2. A score from 0-1 indicating how well it matches the user's needs
3. A brief explanation of why this resource is recommended

Format your response as a JSON array with objects containing resourceId, score, and reason properties.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert recommendation system for mental health resources. Provide personalized recommendations based on user profiles and preferences.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });
    
    const content = response.choices[0]?.message?.content || '{}';
    const recommendations = JSON.parse(content);
    
    // Ensure the response is in the expected format
    if (Array.isArray(recommendations)) {
      return recommendations.map(rec => ({
        resourceId: rec.resourceId,
        score: parseFloat(rec.score) || 0,
        reason: rec.reason || 'Recommended based on your preferences'
      }));
    } else if (recommendations.recommendations && Array.isArray(recommendations.recommendations)) {
      return recommendations.recommendations.map((rec: Recommendation) => ({
        resourceId: rec.resourceId,
        score: parseFloat(rec.score.toString()) || 0,
        reason: rec.reason || 'Recommended based on your preferences'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    return [];
  }
}

// Function to summarize resource content
export async function summarizeResourceContent(
  content: string,
  type: ResourceType,
  title?: string,
  language: string = 'en'
): Promise<string> {
  try {
    // Create prompt based on content type
    let prompt = '';
    
    switch (type) {
      case 'ARTICLE':
        prompt = `Summarize the following article in 3-5 bullet points, focusing on the key takeaways and main ideas:\n\n${title ? `Title: ${title}\n\n` : ''}Content: ${content}`;
        break;
      case 'VIDEO':
        prompt = `Summarize the key points from this video transcript in 3-5 bullet points:\n\n${title ? `Title: ${title}\n\n` : ''}Content: ${content}`;
        break;
      case 'AUDIO':
        prompt = `Summarize the main insights from this audio content in 3-5 bullet points:\n\n${title ? `Title: ${title}\n\n` : ''}Content: ${content}`;
        break;
      case 'PDF':
        prompt = `Extract and summarize the key information from this document in 3-5 bullet points:\n\n${title ? `Title: ${title}\n\n` : ''}Content: ${content}`;
        break;
      default:
        prompt = `Summarize the following content in 3-5 bullet points:\n\n${title ? `Title: ${title}\n\n` : ''}Content: ${content}`;
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
    
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error summarizing content:', error);
    return '';
  }
}

// Function to translate text
export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  try {
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
    
    const prompt = `Translate the following text to ${targetLanguageName}. Maintain the original meaning and tone. If the text is already in ${targetLanguageName}, return it as is:\n\n${text}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in mental health content. Translate accurately while maintaining the original meaning and tone.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });
    
    return response.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('Error translating text:', error);
    return text;
  }
}

// Function to extract text from different file types
export async function extractTextFromFile(fileUrl: string, fileType: string): Promise<string> {
  try {
    // This is a placeholder implementation
    // In a real implementation, you would use appropriate libraries to extract text from different file types
    
    switch (fileType) {
      case 'PDF':
        // Use a PDF parsing library like pdf-parse
        return 'PDF text extraction would be implemented here';
      case 'VIDEO':
        // Use video transcription services
        return 'Video transcription would be implemented here';
      case 'AUDIO':
        // Use audio transcription services
        return 'Audio transcription would be implemented here';
      default:
        // For text-based files, you could fetch the content directly
        const response = await fetch(fileUrl);
        return await response.text();
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return '';
  }
}