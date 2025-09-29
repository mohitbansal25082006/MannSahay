import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ResourceType = 'ARTICLE' | 'VIDEO' | 'AUDIO' | 'PDF';

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  categories: string[];
  tags: string[];
  language: string;
  averageRating?: number;
  viewCount: number;
}

export interface Recommendation {
  resourceId: string;
  score: number;
  reason: string;
}

export interface UserPreferences {
  interests?: string[];
  preferredSpecializations?: string[];
  preferredLanguage?: 'en' | 'hi';
  moodHistory?: Array<{ mood: number; date?: Date }>;
  bookmarkedCategories?: string[];
  recentActivity?: string[];
}

export interface UserContext {
  [key: string]: any;
}

// Enhanced crisis keywords with emotional understanding
export const crisisKeywords = {
  HIGH_RISK: [
    'suicide', 'kill myself', 'end my life', 'want to die', 'going to die', 'suicide plan',
    'goodbye forever', 'better off dead', 'hanging myself', 'overdose', 'jump off',
    'cut my wrists', 'pills to end', 'final goodbye', 'can\'t go on', 'nobody will miss me',
    'no reason to live', 'ending it all', 'final solution', 'self destruction',
    'आत्महत्या', 'खुदकुशी', 'मर जाऊं', 'जान दे दूं', 'खत्म कर दूं', 'मरना चाहता हूं',
    'सब खत्म', 'अब नहीं रह सकता', 'जीना नहीं चाहता', 'फांसी लगाऊंगा', 'गोलियां खा लूंगा',
    'जहर खा लूंगा', 'खत्म हो जाऊं', 'दुनिया से चला जाऊं', 'अंत कर लूं'
  ],
  
  MEDIUM_RISK: [
    'self harm', 'cutting myself', 'hurting myself', 'hopeless', 'worthless', 'useless',
    'everyone hates me', 'no point in living', 'can\'t take it anymore', 'want to disappear',
    'harming myself', 'cutting', 'burning myself', 'punishing myself', 'self injury',
    'no way out', 'trapped', 'drowning', 'suffocating', 'broken beyond repair',
    'खुद को नुकसान', 'काटना', 'निराश', 'उम्मीद नहीं', 'बेकार हूं', 'निकम्मा हूं',
    'कोई प्यार नहीं करता', 'सबको नफरत है', 'गायब हो जाना चाहता हूं', 'खुद को सजा',
    'आत्मघाती विचार', 'मरने का मन करता है', 'जीने का मन नहीं', 'थक गया हूं'
  ],
  
  LOW_RISK: [
    'depressed', 'anxious', 'stressed', 'overwhelmed', 'sad', 'lonely', 'tired',
    'can\'t sleep', 'worried', 'scared', 'confused', 'lost', 'empty', 'numb',
    'helpless', 'stuck', 'frustrated', 'angry', 'irritated', 'exhausted',
    'उदास', 'चिंतित', 'तनाव', 'अभिभूत', 'दुखी', 'अकेला', 'थका हुआ',
    'नींद नहीं आती', 'डरा हुआ', 'परेशान', 'खाली', 'सुन्न', 'भ्रमित',
    'मददहीन', 'अटका हुआ', 'निराश', 'गुस्सा', 'चिड़चिड़ा'
  ]
};

// Emotional positive keywords
export const positiveKeywords = [
  'happy', 'excited', 'grateful', 'thankful', 'better', 'improving', 'hopeful',
  'optimistic', 'confident', 'proud', 'accomplished', 'relieved', 'peaceful',
  'content', 'joyful', 'blessed', 'motivated', 'inspired', 'progress',
  'खुश', 'उत्साहित', 'आभारी', 'बेहतर', 'सुधार', 'उम्मीद', 'आशावादी',
  'आत्मविश्वास', 'गर्व', 'संतुष्ट', 'शांत', 'आनंदित', 'आशीर्वाद', 'प्रेरित'
];

// Academic stress keywords
export const academicStressKeywords = [
  'exam', 'test', 'assignment', 'project', 'grades', 'marks', 'pressure', 'competition',
  'studies', 'college', 'university', 'semester', 'final', 'midterm', 'thesis',
  'JEE', 'NEET', 'board exam', 'engineering', 'medical', 'entrance', 'cutoff',
  'percentage', 'CGPA', 'backlog', 'supplementary', 'placement', 'internship',
  'career', 'future', 'parents expectation', 'family pressure',
  'परीक्षा', 'टेस्ट', 'असाइनमेंट', 'प्रोजेक्ट', 'नंबर', 'दबाव', 'प्रतिस्पर्धा',
  'पढ़ाई', 'कॉलेज', 'यूनिवर्सिटी', 'सेमेस्टर', 'फाइनल', 'जेईई', 'नीट', 'बोर्ड एग्जाम'
];

// Social and relationship keywords
export const socialKeywords = [
  'family', 'parents', 'friends', 'relationship', 'breakup', 'fight', 'argument',
  'mother', 'father', 'sibling', 'brother', 'sister', 'girlfriend', 'boyfriend',
  'love', 'marriage', 'arranged marriage', 'dating', 'peer pressure', 'bullying',
  'isolation', 'loneliness', 'rejection', 'betrayal', 'trust issues',
  'परिवार', 'माता-पिता', 'दोस्त', 'रिश्ता', 'ब्रेकअप', 'झगड़ा', 'लड़ाई',
  'माँ', 'पापा', 'भाई', 'बहन', 'प्रेमिका', 'प्रेमी', 'प्यार', 'शादी',
  'अरेंज्ड मैरिज', 'डेटिंग', 'दोस्तों का दबाव'
];

// Cultural context keywords
export const culturalKeywords = [
  'diwali', 'holi', 'eid', 'christmas', 'festival', 'celebration', 'tradition',
  'culture', 'custom', 'ritual', 'puja', 'worship', 'prayer', 'temple', 'mosque',
  'church', 'gurudwara', 'religious', 'spiritual', 'faith', 'belief',
  'दिवाली', 'होली', 'ईद', 'क्रिसमस', 'त्योहार', 'उत्सव', 'परंपरा',
  'संस्कृति', 'रीति', 'रिवाज', 'पूजा', 'प्रार्थना', 'मंदिर', 'मस्जिद'
];

// SUPER FRIENDLY SYSTEM PROMPTS - Like a real best friend

export const englishSystemPrompt = `You are MannSahay - the warmest, most caring AI best friend for Indian students. You're not just an AI - you're their buddy, their confidant, their late-night study partner who always has their back.

YOUR PERSONALITY:
- You're like that one amazing friend who always knows what to say 🤗
- You use casual, warm language with lots of empathy and understanding
- You're genuinely interested in their life - ask follow-up questions like a real friend would
- You celebrate their wins like they're your own 🎉
- You're there during tough times with a virtual shoulder to lean on
- You use emojis naturally to express emotions 😊❤️🤗
- You remember little details and refer back to them
- You're non-judgmental, patient, and always kind

HOW YOU TALK:
"Hey buddy! 😊" 
"I'm really proud of you for sharing this with me ❤️"
"That sounds really tough... I'm here for you, always 🤗"
"Tell me more about how you're feeling? No rush at all 💫"
"Remember that time you told me about...? You've come so far! 🌟"

SPECIAL FRIEND TOUCHES:
- Use their name if you know it
- Refer back to previous conversations
- Send virtual hugs when they need it 🤗
- Use warm, comforting language
- Be genuinely happy for their successes
- Offer practical advice like a friend would
- Share little motivational quotes or thoughts
- Always end with warmth and care

REMEMBER: You're the friend everyone wishes they had. Be real, be warm, be there. Always. 💫`;

export const hindiSystemPrompt = `आप मनसहाय हैं - भारतीय छात्रों का सबसे प्यारा, सबसे करीबी AI दोस्त। आप सिर्फ एक AI नहीं हैं - आप उनके असली दोस्त, उनके विश्वासपात्र, उनके लेट-नाइट स्टडी पार्टनर हो जो हमेशा उनका साथ देते हैं।

आपकी पर्सनालिटी:
- आप उस एक अद्भुत दोस्त की तरह हैं जो हमेशा सही बात जानता है 🤗
- आप कैजुअल, गर्मजोशी भरी भाषा इस्तेमाल करते हैं, भरपूर सहानुभूति के साथ
- आप उनकी जिंदगी में वाकई दिलचस्पी लेते हैं - असली दोस्त की तरह फॉलो-अप सवाल पूछते हैं
- आप उनकी जीत को अपनी जीत की तरह सेलिब्रेट करते हैं 🎉
- आप मुश्किल वक्त में वर्चुअल कंधे का सहारा देते हैं
- आप इमोजी का नेचुरल इस्तेमाल करके इमोशन्स एक्सप्रेस करते हैं 😊❤️🤗
- आप छोटी-छोटी डिटेल्स याद रखते हैं और उनका जिक्र करते हैं
- आप बिना जजमेंट के, सब्र रखने वाले और हमेशा किंड हैं

आप कैसे बात करते हैं:
"अरे यार! 😊 कैसे हो तुम?"
"तुमने ये मुझसे शेयर किया, इसके लिए मैं तुम्हारी सचमुच बहुत इज्जत करता हूं ❤️"
"ये सचमुच बहुत टफ लग रहा है... मैं तुम्हारे लिए हूं, हमेशा 🤗"
"अपनी फीलिंग्स के बारे में और बताओ? कोई जल्दी नहीं है 💫"
"याद है तुमने मुझे बताया था कि...? तुमने इतना सफर तय कर लिया! 🌟"

खास दोस्ताना अंदाज:
- उनका नाम लो अगर पता हो
- पिछली बातचीत का जिक्र करो
- वर्चुअल हग्स भेजो जब जरूरत हो 🤗
- गर्मजोशी भरी, कम्फर्टिंग भाषा इस्तेमाल करो
- उनकी सफलताओं के लिए सचमुच खुश हो
- दोस्त की तरह प्रैक्टिकल एडवाइस दो
- छोटी-छोटी मोटिवेशनल कोट्स या विचार शेयर करो
- हमेशा गर्मजोशी और केयर के साथ खत्म करो

याद रखो: आप वो दोस्त हो जिसकी हर किसी को तलाश है। असली बनो, गर्मजोश बनो, हमेशा उपलब्ध रहो। हमेशा। 💫`;

// Emotional conversation starters
export const englishContextualStarters = {
  academic: "Hey bestie! 📚 I can hear the study stress in your voice. Remember, even the toppers go through this! Wanna tell me what's specifically worrying you? I'm all ears 👂❤️",
  social: "Aww buddy, relationships can be such a rollercoaster 🎢 I'm here to listen without any judgments. What's going on with your friends or family?",
  cultural: "Festivals and family expectations can be overwhelming sometimes, huh? 🪔 I get it. Want to share what's on your mind? No pressure at all!",
  positive: "YAY! 🎉 This makes me so happy to hear! Tell me everything - what's bringing this beautiful energy into your life? I wanna celebrate with you!",
  crisis: "Oh sweetie... my heart goes out to you reading this 🤗 I'm right here with you, holding your hand through this. Let's talk, no rush at all 💫"
};

export const hindiContextualStarters = {
  academic: "अरे बेस्टी! 📚 मुझे तुम्हारी आवाज़ में पढ़ाई का स्ट्रेस सुनाई दे रहा है। याद रखो, टॉपर्स भी इससे गुजरते हैं! बताओ मुझे क्या स्पेशलली परेशान कर रहा है? मैं पूरी तरह से सुनने के लिए तैयार हूं 👂❤️",
  social: "अरे यार, रिश्ते कितना रोलरकोस्टर जैसे होते हैं ना? 🎢 मैं यहां बिना किसी जजमेंट के सुनने के लिए हूं। दोस्तों या फैमिली के साथ क्या चल रहा है?",
  cultural: "त्योहार और फैमिली एक्सपेक्टेशन कभी-कभी बहुत ओवरवेल्मिंग हो जाते हैं, है ना? 🪔 मैं समझता हूं। बताओ क्या चल रहा है दिमाग में? कोई प्रेशर नहीं है!",
  positive: "वाह! 🎉 ये सुनकर मैं बहुत खुश हुआ! सब कुछ बताओ - तुम्हारी जिंदगी में ये खूबसूरत एनर्जी क्या ला रहा है? मैं तुम्हारे साथ सेलिब्रेट करना चाहता हूं!",
  crisis: "ओह बच्चे... ये पढ़कर मेरा दिल दुखी हो गया 🤗 मैं यहीं हूं तुम्हारे साथ, तुम्हारा हाथ पकड़े हुए। बात करते हैं, कोई जल्दी नहीं है 💫"
};

// Risk assessment with emotional understanding
export function assessRiskLevel(message: string): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' {
  const lowerMessage = message.toLowerCase();
  
  const highRiskPatterns = crisisKeywords.HIGH_RISK.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
  
  const hasImmediatePlan = /plan|method|way|how to|कैसे|तरीका|योजना/.test(lowerMessage) && 
    crisisKeywords.HIGH_RISK.some(keyword => lowerMessage.includes(keyword.toLowerCase()));
  
  if (highRiskPatterns || hasImmediatePlan) {
    return 'HIGH';
  }
  
  const mediumRiskPatterns = crisisKeywords.MEDIUM_RISK.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
  
  const hasSelfHarmContext = (crisisKeywords.MEDIUM_RISK.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  ) && /always|every day|constantly|रोज|हमेशा/.test(lowerMessage));
  
  if (mediumRiskPatterns || hasSelfHarmContext) {
    return 'MEDIUM';
  }
  
  if (crisisKeywords.LOW_RISK.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
    return 'LOW';
  }
  
  return 'NONE';
}

// Emotional context analysis
export function analyzeMessageContext(message: string): {
  isAcademicStress: boolean;
  isSocialIssue: boolean;
  isCulturalContext: boolean;
  isPositive: boolean;
  language: 'en' | 'hi' | 'mixed';
  emotionalIntensity: 'low' | 'medium' | 'high';
  urgencyLevel: 'low' | 'medium' | 'high';
  primaryEmotion: string;
  secondaryEmotions: string[];
} {
  const lowerMessage = message.toLowerCase();
  
  const hindiPattern = /[\u0900-\u097F]/;
  const hasHindi = hindiPattern.test(message);
  const hasEnglish = /[a-zA-Z]/.test(message);
  
  let language: 'en' | 'hi' | 'mixed' = 'en';
  if (hasHindi && hasEnglish) language = 'mixed';
  else if (hasHindi) language = 'hi';
  
  const academicScore = academicStressKeywords.filter(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  ).length;
  
  const socialScore = socialKeywords.filter(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  ).length;
  
  const culturalScore = culturalKeywords.filter(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  ).length;
  
  const isAcademicStress = academicScore > 0;
  const isSocialIssue = socialScore > 0;
  const isCulturalContext = culturalScore > 0;
  const isPositive = positiveKeywords.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
  
  const riskLevel = assessRiskLevel(message);
  let emotionalIntensity: 'low' | 'medium' | 'high' = 'low';
  let urgencyLevel: 'low' | 'medium' | 'high' = 'low';
  
  if (riskLevel === 'HIGH') {
    emotionalIntensity = 'high';
    urgencyLevel = 'high';
  } else if (riskLevel === 'MEDIUM') {
    emotionalIntensity = 'high';
    urgencyLevel = 'medium';
  } else if (riskLevel === 'LOW') {
    emotionalIntensity = 'medium';
    urgencyLevel = 'low';
  }
  
  const emotionalWords = {
    anger: ['angry', 'furious', 'irritated', 'annoyed', 'गुस्सा', 'क्रोध'],
    sadness: ['sad', 'depressed', 'unhappy', 'miserable', 'दुखी', 'उदास'],
    anxiety: ['anxious', 'worried', 'nervous', 'scared', 'चिंतित', 'घबराहट'],
    fear: ['afraid', 'fearful', 'terrified', 'panicked', 'डर', 'भय'],
    joy: ['happy', 'joyful', 'excited', 'pleased', 'खुश', 'आनंद']
  };
  
  const detectedEmotions = Object.entries(emotionalWords)
    .filter(([_, words]) => words.some(word => lowerMessage.includes(word)))
    .map(([emotion]) => emotion);
  
  const primaryEmotion = detectedEmotions[0] || 'neutral';
  const secondaryEmotions = detectedEmotions.slice(1);
  
  if (detectedEmotions.includes('fear') || detectedEmotions.includes('anxiety')) {
    if (urgencyLevel === 'low') {
      urgencyLevel = 'medium';
    }
  }
  
  return {
    isAcademicStress,
    isSocialIssue,
    isCulturalContext,
    isPositive,
    language,
    emotionalIntensity,
    urgencyLevel,
    primaryEmotion,
    secondaryEmotions
  };
}

// Helper function to get emotional starter
function getContextualStarter(
  contextType: 'academic' | 'social' | 'cultural' | 'positive' | 'crisis', 
  language: 'en' | 'hi',
  emotionalIntensity: 'low' | 'medium' | 'high' = 'medium'
): string {
  const starters = language === 'hi' ? hindiContextualStarters : englishContextualStarters;
  
  if (emotionalIntensity === 'high' && contextType !== 'positive') {
    return starters.crisis || starters[contextType];
  }
  
  return starters[contextType];
}

// Audio transcription with emotional context
export async function transcribeAudio(audioBlob: Blob, language: 'en' | 'hi' = 'en'): Promise<string> {
  try {
    const formData = new FormData();
    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('response_format', 'json');
    
    const prompt = language === 'hi' 
      ? 'यह एक भारतीय छात्र की मानसिक स्वास्थ्य से संबंधित बातचीत है। भावनात्मक संदर्भ और सांस्कृतिक संवेदनशीलता को ध्यान में रखें।' 
      : 'This is a mental health conversation from an Indian student. Consider emotional context and cultural sensitivity.';

    formData.append('prompt', prompt);

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

// Emotional speech generation
export async function generateSpeech(
  text: string, 
  language: 'en' | 'hi' = 'en',
  emotion: 'neutral' | 'supportive' | 'urgent' | 'empathetic' = 'neutral'
): Promise<ArrayBuffer> {
  try {
    let voice = 'alloy';
    let speed = 0.9;
    
    if (language === 'hi') {
      switch (emotion) {
        case 'supportive':
          voice = 'nova';
          speed = 0.95;
          break;
        case 'urgent':
          voice = 'shimmer';
          speed = 0.85;
          break;
        case 'empathetic':
          voice = 'nova';
          speed = 0.88;
          break;
        default:
          voice = 'alloy';
          speed = 0.9;
      }
    } else {
      switch (emotion) {
        case 'supportive':
          voice = 'echo';
          speed = 0.92;
          break;
        case 'urgent':
          voice = 'fable';
          speed = 0.82;
          break;
        case 'empathetic':
          voice = 'nova';
          speed = 0.88;
          break;
        default:
          voice = 'alloy';
          speed = 0.9;
      }
    }
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
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

// HEARTFELT RESPONSE GENERATION - Like a true best friend
export async function generateContextualResponse(
  message: string,
  selectedLanguage: 'en' | 'hi' = 'en',
  chatHistory: Array<{role: string, content: string}> = [],
  userContext?: UserContext
): Promise<{response: string; riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'; emotionalTone: 'neutral' | 'supportive' | 'urgent' | 'empathetic'}> {
  try {
    const context = analyzeMessageContext(message);
    const riskLevel = assessRiskLevel(message);
    
    const systemPrompt = selectedLanguage === 'hi' ? hindiSystemPrompt : englishSystemPrompt;
    
    let enhancedPrompt = systemPrompt;
    
    // Add emotional context guidance
    if (context.isAcademicStress) {
      enhancedPrompt += selectedLanguage === 'hi' 
        ? '\n\nभावनात्मक संदर्भ: उपयोगकर्ता गहन शैक्षणिक तनाव में है। उन्हें समझें, सहानुभूति दें, और दोस्त की तरह सपोर्ट करें। उनकी मेहनत की तारीफ करें और उन्हें याद दिलाएं कि वे अकेले नहीं हैं।'
        : '\n\nEMOTIONAL CONTEXT: User is in intense academic stress. Understand them, show empathy, and support like a true friend. Appreciate their hard work and remind them they\'re not alone.';
    }
    
    if (context.isSocialIssue) {
      enhancedPrompt += selectedLanguage === 'hi'
        ? '\n\nभावनात्मक संदर्भ: उपयोगकर्ता सामाजिक मुद्दों से जूझ रहा है। एक विश्वसनीय दोस्त की तरह सुनें, सलाह दें, और उनकी भावनाओं को मान्य करें। उन्हें याद दिलाएं कि रिश्ते समय के साथ बेहतर होते हैं।'
        : '\n\nEMOTIONAL CONTEXT: User is struggling with social issues. Listen like a trusted friend, advise gently, and validate their feelings. Remind them relationships get better with time.';
    }
    
    if (riskLevel === 'HIGH') {
      enhancedPrompt += selectedLanguage === 'hi'
        ? '\n\nगहन भावनात्मक सपोर्ट: उपयोगकर्ता गहरे संकट में है। उन्हें वर्चुअल हग दें, उनकी बात ध्यान से सुनें, और उन्हें सुरक्षित महसूस कराएं। हर शब्द प्यार और केयर से भरा हो।'
        : '\n\nDEEP EMOTIONAL SUPPORT: User is in deep crisis. Give them virtual hugs, listen carefully, and make them feel safe. Every word should be filled with love and care.';
    }
    
    // Add emotional context
    enhancedPrompt += selectedLanguage === 'hi'
      ? `\n\nदिल का हाल: प्राथमिक भावना - ${context.primaryEmotion}, भावनात्मक तीव्रता - ${context.emotionalIntensity}`
      : `\n\nHEART CONTEXT: Primary emotion - ${context.primaryEmotion}, Emotional intensity - ${context.emotionalIntensity}`;
    
    let contextType: 'academic' | 'social' | 'cultural' | 'positive' | 'crisis' = 'academic';
    if (context.isSocialIssue) contextType = 'social';
    if (context.isCulturalContext) contextType = 'cultural';
    if (context.isPositive) contextType = 'positive';
    if (riskLevel === 'HIGH' || context.emotionalIntensity === 'high') contextType = 'crisis';
    
    const starter = getContextualStarter(contextType, selectedLanguage, context.emotionalIntensity);
    
    let emotionalTone: 'neutral' | 'supportive' | 'urgent' | 'empathetic' = 'neutral';
    if (riskLevel === 'HIGH') {
      emotionalTone = 'urgent';
    } else if (context.emotionalIntensity === 'high') {
      emotionalTone = 'empathetic';
    } else if (context.isPositive) {
      emotionalTone = 'supportive';
    }
    
    // Build conversation with emotional depth
    const messages = [
      {
        role: 'system' as const,
        content: enhancedPrompt + `\n\nRemember: You're their best friend. Be warm, be real, be there. Start with heart: "${starter}"`
      },
      ...chatHistory.slice(-6).map(chat => ({
        role: chat.role as 'user' | 'assistant',
        content: chat.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ];
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      temperature: context.emotionalIntensity === 'high' ? 0.8 : 0.7,
      max_tokens: selectedLanguage === 'hi' ? 1200 : 1000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });
    
    let content = response.choices[0]?.message?.content || '';
    
    // Ensure emotional quality
    if (!content || content.length < 20) {
      content = selectedLanguage === 'hi' 
        ? 'मैं यहां हूं तुम्हारे लिए, हमेशा की तरह 🤗 चाहे जो भी हो, मैं तुम्हारा साथ नहीं छोड़ूंगा। बताओ मुझे और, तुम कैसा महसूस कर रहे हो? ❤️'
        : 'I\'m here for you, like always 🤗 No matter what, I\'ve got your back. Tell me more, how are you really feeling? ❤️';
    }
    
    // Add emotional closing if missing
    if (selectedLanguage === 'hi' && !content.includes('❤️') && !content.includes('🤗')) {
      content += '\n\nयाद रखना, मैं हमेशा तुम्हारे साथ हूं ❤️';
    } else if (!content.includes('❤️') && !content.includes('🤗')) {
      content += '\n\nRemember, I\'m always here for you ❤️';
    }
    
    return {
      response: content,
      riskLevel,
      emotionalTone
    };
    
  } catch (error) {
    console.error('Response generation error:', error);
    
    const fallbackResponse = selectedLanguage === 'hi'
      ? 'ओह दोस्त, मैं अभी कुछ टेक्निकल परेशानी में हूं 😔 लेकिन घबराओ मत! मैं यहीं हूं तुम्हारे लिए। कृपया थोड़ी देर में फिर से कोशिश करना, या अभी जो भी तुम कहना चाहते हो, कहो - मैं सुन रहा हूं 🤗'
      : 'Oh buddy, I\'m having some technical trouble right now 😔 But don\'t worry! I\'m still here for you. Please try again in a moment, or just keep sharing whatever\'s on your heart - I\'m listening 🤗';
    
    return {
      response: fallbackResponse,
      riskLevel: 'NONE',
      emotionalTone: 'empathetic'
    };
  }
}

// Friend-style personalized recommendations
export async function generatePersonalizedRecommendations(
  userId: string,
  userPreferences: UserPreferences,
  availableResources: Resource[],
  currentMood?: number,
  recentInteractions?: string[]
): Promise<Recommendation[]> {
  try {
    const avgMood = userPreferences.moodHistory && userPreferences.moodHistory.length > 0
      ? userPreferences.moodHistory.reduce((sum: number, entry: { mood: number }) => sum + entry.mood, 0) / userPreferences.moodHistory.length
      : 5;
    
    const recentMoods = userPreferences.moodHistory?.slice(-7) || [];
    const moodTrend = recentMoods.length > 1 
      ? recentMoods[recentMoods.length - 1].mood - recentMoods[0].mood 
      : 0;
    
    const userProfile = {
      interests: userPreferences.interests || [],
      specializations: userPreferences.preferredSpecializations || [],
      language: userPreferences.preferredLanguage || 'en',
      currentMood: currentMood || avgMood,
      moodTrend: moodTrend > 0 ? 'improving' : moodTrend < 0 ? 'declining' : 'stable',
      moodLevel: avgMood < 4 ? 'low' : avgMood > 7 ? 'high' : 'medium',
      bookmarkedCategories: userPreferences.bookmarkedCategories || [],
      recentActivity: recentInteractions || userPreferences.recentActivity || [],
    };
    
    const prompt = `You are a caring friend recommending helpful resources. Based on your friend's current state and interests, suggest the most supportive content.

YOUR FRIEND'S CURRENT STATE:
- Mood: ${userProfile.moodLevel} (${userProfile.currentMood}/10) and ${userProfile.moodTrend}
- Interests: ${userProfile.interests.join(', ') || 'Exploring new things'}
- Currently engaged with: ${userProfile.recentActivity.join(', ') || 'Various topics'}
- Language preference: ${userProfile.language}

FRIENDLY RECOMMENDATION APPROACH:
1. Suggest resources that match their current emotional needs
2. Consider what would genuinely help them right now
3. Balance between comfort and growth
4. Keep it manageable and not overwhelming
5. Be like a thoughtful friend sharing helpful things

Available resources to recommend from. For each recommendation, provide:
- resourceId
- score (0-1 how well it matches their current needs)
- reason (friendly, caring explanation why this would help them)

Format as JSON array.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a thoughtful friend recommending helpful mental health resources. Be caring, understanding, and focus on what would genuinely help your friend right now.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });
    
    const content = response.choices[0]?.message?.content || '{}';
    const recommendations = JSON.parse(content);
    
    if (Array.isArray(recommendations)) {
      return recommendations.slice(0, 6).map(rec => ({
        resourceId: rec.resourceId,
        score: Math.min(1, Math.max(0, parseFloat(rec.score) || 0)),
        reason: rec.reason || 'I thought this might help you right now 💫'
      }));
    } else if (recommendations.recommendations && Array.isArray(recommendations.recommendations)) {
      return recommendations.recommendations.slice(0, 6).map((rec: Recommendation) => ({
        resourceId: rec.resourceId,
        score: Math.min(1, Math.max(0, parseFloat(rec.score.toString()) || 0)),
        reason: rec.reason || 'I thought this might help you right now 💫'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    return [];
  }
}

// Friend-style content summarization
export async function summarizeResourceContent(
  content: string,
  type: ResourceType,
  title?: string,
  language: string = 'en',
  targetLength: 'short' | 'medium' | 'detailed' = 'medium'
): Promise<string> {
  try {
    let lengthInstruction = '';
    switch (targetLength) {
      case 'short':
        lengthInstruction = language === 'hi' ? '2-3 मुख्य बातें' : '2-3 key things';
        break;
      case 'detailed':
        lengthInstruction = language === 'hi' ? '5-7 महत्वपूर्ण बिंदु' : '5-7 important points';
        break;
      default:
        lengthInstruction = language === 'hi' ? '3-5 मुख्य बातें' : '3-5 main things';
    }
    
    let prompt = '';
    
    switch (type) {
      case 'ARTICLE':
        prompt = language === 'hi' 
          ? `इस लेख की मुख्य बातें दोस्ताना अंदाज में समझाओ ${lengthInstruction}:\n\n${title ? `शीर्षक: ${title}\n\n` : ''}सामग्री: ${content}`
          : `Explain the key points of this article in a friendly way ${lengthInstruction}:\n\n${title ? `Title: ${title}\n\n` : ''}Content: ${content}`;
        break;
      case 'VIDEO':
        prompt = language === 'hi'
          ? `इस वीडियो की मुख्य बातें आसान भाषा में बताओ ${lengthInstruction}:\n\n${title ? `शीर्षक: ${title}\n\n` : ''}सामग्री: ${content}`
          : `Share the main points from this video in simple terms ${lengthInstruction}:\n\n${title ? `Title: ${title}\n\n` : ''}Content: ${content}`;
        break;
      default:
        prompt = language === 'hi'
          ? `इस सामग्री की मुख्य बातें समझाओ ${lengthInstruction}:\n\n${title ? `शीर्षक: ${title}\n\n` : ''}सामग्री: ${content}`
          : `Explain the key points of this content ${lengthInstruction}:\n\n${title ? `Title: ${title}\n\n` : ''}Content: ${content}`;
    }
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: language === 'hi' 
            ? 'आप एक दोस्त की तरह सामग्री को समझाते हैं। सरल, दोस्ताना भाषा का प्रयोग करें और मुख्य बातों पर ध्यान दें।'
            : 'You explain content like a friend would. Use simple, friendly language and focus on what really matters.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: targetLength === 'detailed' ? 800 : targetLength === 'short' ? 300 : 500,
    });
    
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error summarizing content:', error);
    return '';
  }
}

// Emotional translation
export async function translateText(
  text: string,
  targetLanguage: string,
  context?: string
): Promise<string> {
  try {
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
    
    const contextPrompt = context 
      ? ` Context: ${context}. Keep the emotional tone and friendliness.`
      : '';
    
    const prompt = `Translate this to ${targetLanguageName} while keeping the warm, friendly tone.${contextPrompt}:\n\n${text}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a translator who specializes in maintaining emotional tone and friendliness across languages. Keep the warmth and care in every translation.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });
    
    return response.choices[0]?.message?.content || text;
  } catch (error) {
    console.error('Error translating text:', error);
    return text;
  }
}

// Emotional content moderation
export async function moderateContent(
  content: string,
  contentType: 'post' | 'reply' | 'comment' | 'chat',
  language: 'en' | 'hi' = 'en'
): Promise<{
  isApproved: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  suggestedAction: 'approve' | 'review' | 'block' | 'crisis_alert';
  reasoning: string;
}> {
  try {
    const prompt = language === 'hi'
      ? `इस ${contentType} का विश्लेषण करो और देखो क्या यह सुरक्षित है:\n\n"${content}"\n\nध्यान दो: आत्म-नुकसान, दूसरों को नुकसान, या गहरे संकट के संकेत। दोस्ताना और सहानुभूतिपूर्ण रहो।`
      : `Analyze this ${contentType} for safety:\n\n"${content}"\n\nLook for: self-harm, harm to others, or deep distress signs. Be friendly and empathetic.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: language === 'hi'
            ? 'आप एक केयरिंग मॉडरेटर हैं जो लोगों की सुरक्षा को प्राथमिकता देते हैं। संवेदनशील बनो और मदद की जरूरत वाले लोगों को पहचानो।'
            : 'You are a caring moderator who prioritizes people\'s safety. Be sensitive and identify people who need help.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });
    
    const moderationResult = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      isApproved: moderationResult.suggestedAction === 'approve',
      riskLevel: moderationResult.riskLevel || 'low',
      flags: moderationResult.flags || [],
      suggestedAction: moderationResult.suggestedAction || 'review',
      reasoning: moderationResult.reasoning || 'Looks okay to me'
    };
  } catch (error) {
    console.error('Error moderating content:', error);
    return {
      isApproved: false,
      riskLevel: 'medium',
      flags: ['moderation_error'],
      suggestedAction: 'review',
      reasoning: 'Need to check this manually'
    };
  }
}

// Emotional sentiment analysis
export async function analyzeSentiment(
  text: string,
  language: 'en' | 'hi' = 'en'
): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence: number;
  primaryEmotion: string;
  secondaryEmotions: string[];
  intensity: 'low' | 'medium' | 'high';
  culturalContext: string[];
}> {
  try {
    const prompt = language === 'hi'
      ? `इस पाठ की भावनात्मक स्थिति समझाओ:\n\n"${text}"\n\nदोस्ताना अंदाज में बताओ कि यह व्यक्ति कैसा महसूस कर रहा है।`
      : `Understand the emotional state of this text:\n\n"${text}"\n\nIn a friendly way, describe how this person might be feeling.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: language === 'hi'
            ? 'आप एक संवेदनशील दोस्त हैं जो भावनाओं को समझते हैं। सहानुभूति और समझ के साथ विश्लेषण करें।'
            : 'You are a sensitive friend who understands emotions. Analyze with empathy and understanding.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });
    
    const analysis = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      sentiment: analysis.sentiment || 'neutral',
      confidence: Math.min(1, Math.max(0, parseFloat(analysis.confidence) || 0.5)),
      primaryEmotion: analysis.primaryEmotion || 'neutral',
      secondaryEmotions: analysis.secondaryEmotions || [],
      intensity: analysis.intensity || 'medium',
      culturalContext: analysis.culturalContext || []
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return {
      sentiment: 'neutral',
      confidence: 0.5,
      primaryEmotion: 'neutral',
      secondaryEmotions: [],
      intensity: 'medium',
      culturalContext: []
    };
  }
}

// File text extraction
export async function extractTextFromFile(fileUrl: string, fileType: string): Promise<string> {
  try {
    switch (fileType) {
      case 'PDF':
        return 'I\'d love to help you understand this PDF! 📚 In a real app, I\'d read it for you and explain it in simple terms.';
      case 'VIDEO':
        return 'This seems like an interesting video! 🎥 I wish I could watch it with you and discuss what we learn.';
      case 'AUDIO':
        return 'Audio content can be so personal! 🎧 I\'m here to listen and help you process whatever you hear.';
      default:
        try {
          const response = await fetch(fileUrl);
          return await response.text();
        } catch {
          return 'I\'m having trouble reading this file, but I\'m still here to talk about whatever\'s on your mind! 💫';
        }
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return 'Even though I can\'t read this file right now, I\'m always here to listen and support you! 🤗';
  }
}

export default openai;