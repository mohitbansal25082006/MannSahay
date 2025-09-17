'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface ChatSession {
  id: string;
  title: string | null;
  isActive: boolean;
  isArchived: boolean;
  language: string;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  totalMessages: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    chats: number;
  };
  chats: Array<{
    content: string;
    role: string;
    timestamp: string;
  }>;
}

export const useChatSessions = () => {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [archivedSessions, setArchivedSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all chat sessions (active + archived)
  const loadSessions = useCallback(async () => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/chat/sessions');
      
      if (!response.ok) {
        throw new Error('Failed to load chat sessions');
      }

      const data = await response.json();
      const allSessions = data.sessions || [];

      // Separate active and archived sessions
      const active = allSessions.filter((s: ChatSession) => !s.isArchived);
      const archived = allSessions.filter((s: ChatSession) => s.isArchived);

      setSessions(active);
      setArchivedSessions(archived);

      // Set current active session
      const activeSession = active.find((s: ChatSession) => s.isActive);
      if (activeSession) {
        setCurrentSession(activeSession);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
      console.error('Load sessions error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Load archived sessions (now just reloads all and filters)
  const loadArchivedSessions = useCallback(async () => {
    await loadSessions(); // Now loads everything, including archived
  }, [loadSessions]);

  // Create new chat session
  const createSession = useCallback(async (title?: string, language: string = 'en') => {
    if (!session?.user) return null;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, language }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat session');
      }

      const data = await response.json();
      const newSession = data.session;

      // Update sessions list
      setSessions(prev => {
        const updated = prev.map(s => ({ ...s, isActive: false }));
        return [{ ...newSession, _count: { chats: 0 }, chats: [] }, ...updated];
      });

      setCurrentSession(newSession);
      return newSession;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      console.error('Create session error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Update session (rename, archive)
  const updateSession = useCallback(async (
    sessionId: string, 
    updates: { title?: string; isArchived?: boolean }
  ) => {
    if (!session?.user) return null;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update chat session');
      }

      const data = await response.json();
      const updatedSession = data.session;

      // Update sessions list
      if (updates.isArchived) {
        // Moving to archived
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        setArchivedSessions(prev => [...prev, updatedSession]);
      } else {
        // Moving from archived to active or updating active
        setSessions(prev => prev.map(s => 
          s.id === sessionId ? { ...s, ...updatedSession } : s
        ));
        setArchivedSessions(prev => prev.filter(s => s.id !== sessionId));
      }

      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, ...updatedSession } : null);
      }

      return updatedSession;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update session');
      console.error('Update session error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session, currentSession]);

  // Load specific session with messages
  const loadSession = useCallback(async (sessionId: string) => {
    if (!session?.user) return null;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/chat/sessions/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load chat session');
      }

      const data = await response.json();
      const loadedSession = data.session;

      // Update sessions list to mark this as active
      setSessions(prev => prev.map(s => ({
        ...s,
        isActive: s.id === sessionId
      })));

      // Do not unarchive; just update the current session
      setCurrentSession(loadedSession);

      // Update archivedSessions or sessions if needed based on loadedSession.isArchived
      if (loadedSession.isArchived) {
        setArchivedSessions(prev => 
          prev.map(s => s.id === sessionId ? loadedSession : s)
        );
      } else {
        setSessions(prev => 
          prev.map(s => s.id === sessionId ? loadedSession : s)
        );
      }

      return loadedSession;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
      console.error('Load session error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string) => {
    if (!session?.user) return false;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat session');
      }

      // Remove from sessions list
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setArchivedSessions(prev => prev.filter(s => s.id !== sessionId));

      // If deleted session was current, clear current session
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }

      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
      console.error('Delete session error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session, currentSession]);

  // Archive session
  const archiveSession = useCallback(async (sessionId: string) => {
    return await updateSession(sessionId, { isArchived: true });
  }, [updateSession]);

  // Unarchive session
  const unarchiveSession = useCallback(async (sessionId: string) => {
    return await updateSession(sessionId, { isArchived: false });
  }, [updateSession]);

  // Auto-load sessions when user is authenticated
  useEffect(() => {
    if (session?.user) {
      loadSessions();
    }
  }, [session, loadSessions]);

  return {
    sessions,
    archivedSessions,
    currentSession,
    isLoading,
    error,
    loadSessions,
    loadArchivedSessions,
    createSession,
    loadSession,
    updateSession,
    deleteSession,
    archiveSession,
    unarchiveSession,
    clearError: () => setError(null),
  };
};