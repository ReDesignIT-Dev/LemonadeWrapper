export interface ChatSession {
  id: number;
  userId: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isUserMessage: boolean;
  chatSessionId: number;
}
