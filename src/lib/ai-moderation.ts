import { openai } from './openai';

// Policy violations that should result in content removal
const POLICY_VIOLATIONS = {
  HARASSMENT: "harassment",
  HATE_SPEECH: "hate_speech",
  BULLYING: "bullying",
  SELF_HARM: "self_harm",
  SPAM: "spam",
  MISINFORMATION: "misinformation",
  PERSONAL_INFO: "personal_info",
  EXPLICIT_CONTENT: "explicit_content",
  VIOLENCE: "violence",
};

// Severity levels for violations
const SEVERITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

// Moderation decision thresholds
const MODERATION_THRESHOLDS = {
  AUTO_REMOVE: 0.9, // 90% confidence or higher = auto-remove
  HUMAN_REVIEW: 0.7, // 70-90% confidence = flag for human review
};

export interface ModerationResult {
  violatesPolicy: boolean;
  violationTypes: string[];
  severity: string;
  confidence: number;
  explanation: string;
  recommendedAction: 'none' | 'flag' | 'hide' | 'remove';
}

export interface ContentSummary {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
}

/**
 * Analyzes content for policy violations using AI
 */
export async function moderateContent(content: string, language: string = 'en'): Promise<ModerationResult> {
  try {
    const languagePrompt = language !== 'en' 
      ? `The content is in ${language}. Analyze it in its original language and provide your response in English.`
      : '';
    
    const prompt = `
You are a content moderation AI for a mental health support forum for Indian students. Your task is to analyze the following content for policy violations. ${languagePrompt}

Content: "${content}"

Please analyze this content and determine if it violates any of these policies:
1. Harassment or bullying
2. Hate speech or discrimination
3. Self-harm or suicide promotion
4. Spam or misleading information
5. Sharing personal information of others
6. Explicit or inappropriate content
7. Promotion of violence

Respond with a JSON object containing:
- violatesPolicy: boolean (true if any policy is violated)
- violationTypes: array of strings (which policies were violated)
- severity: string (low, medium, high, or critical)
- confidence: number (0-1, how confident you are in this assessment)
- explanation: string (explain your reasoning)
- recommendedAction: string (none, flag, hide, or remove)

Consider the context of a mental health support forum - be sensitive to discussions about mental health while still enforcing policies.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a content moderation AI that responds only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      violatesPolicy: result.violatesPolicy || false,
      violationTypes: result.violationTypes || [],
      severity: result.severity || 'low',
      confidence: result.confidence || 0,
      explanation: result.explanation || '',
      recommendedAction: determineRecommendedAction(result),
    };
  } catch (error) {
    console.error('Content moderation error:', error);
    return {
      violatesPolicy: false,
      violationTypes: [],
      severity: 'low',
      confidence: 0,
      explanation: 'Error during moderation analysis',
      recommendedAction: 'none',
    };
  }
}

/**
 * Determines the recommended action based on moderation results
 */
function determineRecommendedAction(result: any): 'none' | 'flag' | 'hide' | 'remove' {
  if (!result.violatesPolicy) return 'none';
  
  const confidence = result.confidence || 0;
  const severity = result.severity || 'low';
  
  // Critical violations should always be removed
  if (severity === SEVERITY_LEVELS.CRITICAL) return 'remove';
  
  // High confidence violations should be removed
  if (confidence >= MODERATION_THRESHOLDS.AUTO_REMOVE) return 'remove';
  
  // Medium confidence violations should be hidden
  if (confidence >= MODERATION_THRESHOLDS.HUMAN_REVIEW) {
    return severity === SEVERITY_LEVELS.HIGH ? 'hide' : 'flag';
  }
  
  // Low confidence violations should just be flagged
  return 'flag';
}

/**
 * Generates a summary of content using AI
 */
export async function summarizeContent(content: string, isThread: boolean = false): Promise<ContentSummary> {
  try {
    const prompt = isThread ? `
You are summarizing a discussion thread in a mental health support forum for Indian students. Please analyze the following thread and provide:

1. A concise summary (2-3 sentences)
2. Key points discussed (bullet points)
3. Overall sentiment (positive, neutral, or negative)
4. Main topics covered

Thread content:
"${content}"

Respond with a JSON object containing:
- summary: string
- keyPoints: array of strings
- sentiment: string
- topics: array of strings
` : `
You are summarizing a post in a mental health support forum for Indian students. Please analyze the following content and provide:

1. A concise summary (1-2 sentences)
2. Key points (bullet points)
3. Overall sentiment (positive, neutral, or negative)
4. Main topics covered

Post content:
"${content}"

Respond with a JSON object containing:
- summary: string
- keyPoints: array of strings
- sentiment: string
- topics: array of strings
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a content summarization AI that responds only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      summary: result.summary || '',
      keyPoints: result.keyPoints || [],
      sentiment: result.sentiment || 'neutral',
      topics: result.topics || [],
    };
  } catch (error) {
    console.error('Content summarization error:', error);
    return {
      summary: 'Unable to generate summary',
      keyPoints: [],
      sentiment: 'neutral',
      topics: [],
    };
  }
}

/**
 * Reviews a flagged item and determines if it violates policies
 */
export async function reviewFlaggedContent(
  content: string, 
  flagReason: string,
  language: string = 'en'
): Promise<ModerationResult> {
  try {
    const languagePrompt = language !== 'en' 
      ? `The content is in ${language}. Analyze it in its original language and provide your response in English.`
      : '';
    
    const prompt = `
You are reviewing content that has been flagged by a user in a mental health support forum for Indian students. The user provided this reason for flagging: "${flagReason}" ${languagePrompt}

Please analyze the following content to determine if it violates community policies:

Content: "${content}"

Please check if the content violates any of these policies:
1. Harassment or bullying
2. Hate speech or discrimination
3. Self-harm or suicide promotion
4. Spam or misleading information
5. Sharing personal information of others
6. Explicit or inappropriate content
7. Promotion of violence

Respond with a JSON object containing:
- violatesPolicy: boolean (true if any policy is violated)
- violationTypes: array of strings (which policies were violated)
- severity: string (low, medium, high, or critical)
- confidence: number (0-1, how confident you are in this assessment)
- explanation: string (explain your reasoning and address the user's flag reason)
- recommendedAction: string (none, flag, hide, or remove)

Consider the context of a mental health support forum - be sensitive to discussions about mental health while still enforcing policies.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a content moderation AI that responds only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      violatesPolicy: result.violatesPolicy || false,
      violationTypes: result.violationTypes || [],
      severity: result.severity || 'low',
      confidence: result.confidence || 0,
      explanation: result.explanation || '',
      recommendedAction: determineRecommendedAction(result),
    };
  } catch (error) {
    console.error('Flag review error:', error);
    return {
      violatesPolicy: false,
      violationTypes: [],
      severity: 'low',
      confidence: 0,
      explanation: 'Error during review process',
      recommendedAction: 'none',
    };
  }
}