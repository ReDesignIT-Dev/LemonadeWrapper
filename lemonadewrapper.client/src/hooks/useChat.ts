import { useState, useCallback, useEffect } from 'react';
import type { ChatSession, ChatMessage } from '../types/chat';
import type { LemonadeSettings } from './useSettings';
import * as api from '../services/api';

const USER_ID = 'default-user';
const TITLES_STORAGE_KEY = 'lemonade-session-titles';

function loadTitles(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TITLES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistTitles(titles: Record<string, string>) {
  localStorage.setItem(TITLES_STORAGE_KEY, JSON.stringify(titles));
}

export function useChat(settings: LemonadeSettings) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>(loadTitles);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSession = sessions.find(s => s.sessionId === activeSessionId) ?? null;

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist titles whenever they change
  useEffect(() => {
    persistTitles(titles);
  }, [titles]);

  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getSessions(USER_ID);
      // Sort by most recently updated first
      data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setSessions(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSession = useCallback(async () => {
    try {
      const sessionId = crypto.randomUUID();
      const session = await api.createSession(USER_ID, sessionId);
      setSessions(prev => [session, ...prev]);
      setActiveSessionId(session.sessionId);
      setMessages([]);
      // Auto-generate a default title
      setTitles(prev => {
        const chatNumber = Object.keys(prev).length + 1;
        return { ...prev, [session.sessionId]: `New Chat ${chatNumber}` };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create session');
    }
  }, []);

  const selectSession = useCallback(async (sessionId: string) => {
    if (sessionId === activeSessionId) return;
    setActiveSessionId(sessionId);
    try {
      setIsLoading(true);
      setError(null);
      const msgs = await api.getMessages(USER_ID, sessionId);
      setMessages(msgs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load messages');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId]);

  const renameSession = useCallback((sessionId: string, newTitle: string) => {
    if (newTitle.trim()) {
      setTitles(prev => ({ ...prev, [sessionId]: newTitle.trim() }));
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!activeSessionId || isSending || !content.trim()) return;

    if (!settings.aiServerUrl.trim()) {
      setError('Please configure the AI Server URL in Settings (⚙️) before chatting.');
      return;
    }

    if (!settings.selectedModel.trim()) {
      setError('Please open Settings (⚙️), connect to your server and select a model first.');
      return;
    }

    const trimmed = content.trim();
    // Use a unique negative ID as a temporary key for the in-progress streaming bubble
    const STREAMING_ID = -(Date.now());

    try {
      setIsSending(true);
      setError(null);

      // 1. Save user message to DB and display it immediately
      const userMsg = await api.addMessage(USER_ID, activeSessionId, 'user', trimmed, true);
      setMessages(prev => [...prev, userMsg]);

      // Auto-generate title from first message if still using the default
      setTitles(prev => {
        const current = prev[activeSessionId];
        if (!current || current.startsWith('New Chat')) {
          const autoTitle = trimmed.slice(0, 40) + (trimmed.length > 40 ? '…' : '');
          return { ...prev, [activeSessionId]: autoTitle };
        }
        return prev;
      });

      // Bump the session to the top of the list (client-side)
      setSessions(prev => {
        const updated = prev.map(s =>
          s.sessionId === activeSessionId
            ? { ...s, updatedAt: new Date().toISOString() }
            : s
        );
        return updated.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });

      // 2. Stream AI response token-by-token
      let firstChunk = true;

      await api.sendChatStream(
        USER_ID,
        activeSessionId,
        trimmed,
        settings.aiServerUrl,
        settings.apiKey,
        settings.selectedModel,
        (token) => {
          if (firstChunk) {
            firstChunk = false;
            // TypingIndicator disappears; replace it with the streaming bubble
            setIsSending(false);
            setMessages(prev => [
              ...prev,
              {
                id: STREAMING_ID,
                role: 'assistant' as const,
                content: token,
                timestamp: new Date().toISOString(),
                isUserMessage: false,
                chatSessionId: -1,
              },
            ]);
          } else {
            // Append each subsequent token to the streaming bubble
            setMessages(prev =>
              prev.map(m =>
                m.id === STREAMING_ID ? { ...m, content: m.content + token } : m
              )
            );
          }
        },
        () => {
          // Stream finished — server has persisted the assistant message
          setIsSending(false);
        },
        (err) => {
          setIsSending(false);
          setError(err.message);
          // Remove the incomplete streaming bubble on error
          setMessages(prev => prev.filter(m => m.id !== STREAMING_ID));
        }
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message');
      setIsSending(false);
    }
  }, [activeSessionId, isSending, settings]);

  const getTitle = useCallback((sessionId: string): string => {
    return titles[sessionId] || 'New Chat';
  }, [titles]);

  const clearError = useCallback(() => setError(null), []);

  return {
    sessions,
    activeSession,
    activeSessionId,
    messages,
    isLoading,
    isSending,
    error,
    createSession,
    selectSession,
    sendMessage,
    renameSession,
    getTitle,
    clearError,
  };
}
