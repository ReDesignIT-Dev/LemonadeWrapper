import type { ChatSession, ChatMessage } from '../types/chat';

const API_BASE = '/LemonadeServer';

/** Fetches the list of available model IDs from the external AI server via our proxy. */
export async function fetchModels(aiServerUrl: string, apiKey: string): Promise<string[]> {
  const params = new URLSearchParams({
    url: aiServerUrl,
    apiKey,
  });
  const res = await fetch(`${API_BASE}/models?${params}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed to fetch models: ${res.statusText}`);
  }
  return res.json();
}


export async function getSessions(userId: string): Promise<ChatSession[]> {
  const res = await fetch(`${API_BASE}/sessions/${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(`Failed to fetch sessions: ${res.statusText}`);
  return res.json();
}

export async function createSession(userId: string, sessionId: string): Promise<ChatSession> {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, sessionId }),
  });
  if (!res.ok) throw new Error(`Failed to create session: ${res.statusText}`);
  return res.json();
}

export async function getMessages(userId: string, sessionId: string): Promise<ChatMessage[]> {
  const res = await fetch(
    `${API_BASE}/sessions/${encodeURIComponent(userId)}/${encodeURIComponent(sessionId)}/messages`
  );
  if (!res.ok) throw new Error(`Failed to fetch messages: ${res.statusText}`);
  return res.json();
}

export async function addMessage(
  userId: string,
  sessionId: string,
  role: string,
  content: string,
  isUserMessage: boolean
): Promise<ChatMessage> {
  const res = await fetch(
    `${API_BASE}/sessions/${encodeURIComponent(userId)}/${encodeURIComponent(sessionId)}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, content, isUserMessage }),
    }
  );
  if (!res.ok) throw new Error(`Failed to send message: ${res.statusText}`);
  return res.json();
}

/**
 * Opens a streaming SSE connection to the /chat endpoint.
 * The server proxies the external AI response and emits tokens one-by-one.
 * Callbacks fire for each token chunk, on completion, and on error.
 */
export async function sendChatStream(
  userId: string,
  sessionId: string,
  content: string,
  aiServerUrl: string,
  apiKey: string,
  model: string,
  onChunk: (token: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(
      `${API_BASE}/sessions/${encodeURIComponent(userId)}/${encodeURIComponent(sessionId)}/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, aiServerUrl, apiKey, model }),
      }
    );
  } catch (e) {
    onError(e instanceof Error ? e : new Error('Network error'));
    return;
  }

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    onError(new Error(text || `Chat request failed: ${res.statusText}`));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      // SSE events are separated by blank lines; split on newlines
      const lines = buffer.split('\n');
      // Keep the last (potentially incomplete) line in the buffer
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        try {
          // Server sends each token as a JSON-serialised string
          const token = JSON.parse(data) as string;
          if (token) onChunk(token);
        } catch {
          /* skip malformed data lines */
        }
      }
    }
    onDone();
  } catch (e) {
    onError(e instanceof Error ? e : new Error('Stream reading failed'));
  }
}
