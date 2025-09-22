'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  language?: string;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  context?: Record<string, unknown>;
  audioUrl?: string;
}

export const useChatHistory = () => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Load chat history for a session
  const loadChatHistory = useCallback(async (
    sessionId: string, 
    limit: number = 50, 
    offset: number = 0,
    append: boolean = false
  ) => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/chat?sessionId=${sessionId}&limit=${limit}&offset=${offset}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to load chat history');
      }

      const data = await response.json();
      const newMessages = data.chats || [];

      if (append) {
        setMessages(prev => [...prev, ...newMessages]);
      } else {
        setMessages(newMessages);
      }

      setHasMore(data.hasMore || false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chat history');
      console.error('Load chat history error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Clear chat history
  const clearHistory = useCallback(() => {
    setMessages([]);
    setHasMore(true);
    setError(null);
  }, []);

  // Add message to current history (for real-time updates)
  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  return {
    messages,
    isLoading,
    error,
    hasMore,
    loadChatHistory,
    clearHistory,
    addMessage,
    clearError: () => setError(null),
  };
};