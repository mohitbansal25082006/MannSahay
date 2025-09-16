import { prisma } from './db';

export interface ChatHistoryExport {
  sessionId: string;
  title: string;
  exportDate: string;
  language: string;
  totalMessages: number;
  riskLevel: string;
  messages: Array<{
    role: string;
    content: string;
    timestamp: string;
    riskLevel: string;
  }>;
  metadata: {
    userId: string;
    createdAt: string;
    lastMessageAt: string;
  };
}

export class ChatHistoryManager {
  
  // Auto-generate session titles based on first message
  static generateSessionTitle(message: string, language: 'en' | 'hi' = 'en'): string {
    // Remove extra whitespace and newlines
    const cleaned = message.trim().replace(/\s+/g, ' ');
    
    // Extract key topics using simple keyword matching
    const academicKeywords = language === 'en' 
      ? ['exam', 'test', 'study', 'assignment', 'grade', 'college', 'university']
      : ['परीक्षा', 'टेस्ट', 'पढ़ाई', 'कॉलेज', 'विश्वविद्यालय', 'असाइनमेंट'];
    
    const emotionalKeywords = language === 'en'
      ? ['anxious', 'depressed', 'stressed', 'worried', 'sad', 'lonely', 'overwhelmed']
      : ['चिंतित', 'उदास', 'तनाव', 'परेशान', 'अकेला', 'दुखी'];
    
    const lowerMessage = cleaned.toLowerCase();
    
    // Check for academic topics
    if (academicKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return language === 'en' ? '📚 Academic Concerns' : '📚 शैक्षणिक चिंताएं';
    }
    
    // Check for emotional topics
    if (emotionalKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return language === 'en' ? '💭 Emotional Support' : '💭 भावनात्मक सहारा';
    }
    
    // Default to truncated message
    return cleaned.length > 40 ? cleaned.substring(0, 37) + '...' : cleaned;
  }

  // Clean up old chat sessions (privacy feature)
  static async cleanupOldSessions(userId: string, daysToKeep: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.chatSession.deleteMany({
        where: {
          userId: userId,
          lastMessageAt: {
            lt: cutoffDate
          },
          isActive: false // Don't delete active sessions
        }
      });

      return result.count;
    } catch (error) {
      console.error('Cleanup error:', error);
      return 0;
    }
  }

  // Export chat history in various formats
  static async exportChatHistory(
    sessionId: string, 
    userId: string, 
    format: 'json' | 'txt' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const session = await prisma.chatSession.findFirst({
        where: { 
          id: sessionId,
          userId: userId
        },
        include: {
          chats: {
            orderBy: { timestamp: 'asc' }
          }
        }
      });

      if (!session) {
        throw new Error('Session not found');
      }

      const exportData: ChatHistoryExport = {
        sessionId: session.id,
        title: session.title || 'Untitled Conversation',
        exportDate: new Date().toISOString(),
        language: session.language,
        totalMessages: session.totalMessages,
        riskLevel: session.riskLevel,
        messages: session.chats.map(chat => ({
          role: chat.role,
          content: chat.content,
          timestamp: chat.timestamp.toISOString(),
          riskLevel: chat.riskLevel
        })),
        metadata: {
          userId: session.userId,
          createdAt: session.createdAt.toISOString(),
          lastMessageAt: session.lastMessageAt.toISOString()
        }
      };

      switch (format) {
        case 'json':
          return JSON.stringify(exportData, null, 2);
        
        case 'txt':
          return this.formatAsText(exportData);
        
        case 'csv':
          return this.formatAsCSV(exportData);
        
        default:
          return JSON.stringify(exportData, null, 2);
      }

    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  private static formatAsText(data: ChatHistoryExport): string {
    let output = `Chat Session: ${data.title}\n`;
    output += `Export Date: ${new Date(data.exportDate).toLocaleString()}\n`;
    output += `Language: ${data.language}\n`;
    output += `Total Messages: ${data.totalMessages}\n`;
    output += `Risk Level: ${data.riskLevel}\n`;
    output += `\n${'='.repeat(50)}\n\n`;

    data.messages.forEach((message, index) => {
      const timestamp = new Date(message.timestamp).toLocaleString();
      const role = message.role === 'user' ? 'You' : 'MannSahay';
      
      output += `[${timestamp}] ${role}:\n`;
      output += `${message.content}\n\n`;
    });

    return output;
  }

  private static formatAsCSV(data: ChatHistoryExport): string {
    let csv = 'Timestamp,Role,Content,Risk Level\n';
    
    data.messages.forEach(message => {
      const timestamp = new Date(message.timestamp).toISOString();
      const content = message.content.replace(/"/g, '""'); // Escape quotes
      csv += `"${timestamp}","${message.role}","${content}","${message.riskLevel}"\n`;
    });

    return csv;
  }

  // Get chat statistics
  static async getChatStatistics(userId: string): Promise<{
    totalSessions: number;
    totalMessages: number;
    averageMessagesPerSession: number;
    riskDistribution: Record<string, number>;
    languageDistribution: Record<string, number>;
    mostActiveDay: string;
  }> {
    try {
      const sessions = await prisma.chatSession.findMany({
        where: { userId },
        include: {
          chats: true
        }
      });

      const totalSessions = sessions.length;
      const totalMessages = sessions.reduce((sum, session) => sum + session.totalMessages, 0);
      const averageMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;

      // Risk distribution
      const riskDistribution: Record<string, number> = {};
      sessions.forEach(session => {
        riskDistribution[session.riskLevel] = (riskDistribution[session.riskLevel] || 0) + 1;
      });

      // Language distribution
      const languageDistribution: Record<string, number> = {};
      sessions.forEach(session => {
        languageDistribution[session.language] = (languageDistribution[session.language] || 0) + 1;
      });

      // Most active day (simplified)
      const dayCount: Record<string, number> = {};
      sessions.forEach(session => {
        const day = new Date(session.createdAt).toDateString();
        dayCount[day] = (dayCount[day] || 0) + 1;
      });

      const mostActiveDay = Object.entries(dayCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'No data';

      return {
        totalSessions,
        totalMessages,
        averageMessagesPerSession: Math.round(averageMessagesPerSession * 100) / 100,
        riskDistribution,
        languageDistribution,
        mostActiveDay
      };

    } catch (error) {
      console.error('Statistics error:', error);
      throw error;
    }
  }
}