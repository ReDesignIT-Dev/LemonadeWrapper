import { Box, Typography, TextField } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import type { ChatSession, ChatMessage } from '../types/chat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import EmptyState from './EmptyState';

interface ChatWindowProps {
  session: ChatSession | null;
  title: string;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  onSendMessage: (content: string) => void;
  onNewChat: () => void;
  selectedModel: string;
}

export default function ChatWindow({
  session,
  title,
  messages,
  isLoading,
  isSending,
  onSendMessage,
  onNewChat,
  selectedModel,
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canSend = !!selectedModel.trim();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isSending || !canSend) return;
    onSendMessage(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Empty state — no session selected
  if (!session) {
    return (
      <Box sx={{ flex: 1, display: 'flex', background: '#08080d' }}>
        <EmptyState onNewChat={onNewChat} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#08080d',
        height: '100vh',
        minWidth: 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          background: 'rgba(255, 255, 255, 0.015)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}
      >
        <Box sx={{ fontSize: '1.2rem', lineHeight: 1 }}>🍋</Box>
        <Typography
          variant="h6"
          noWrap
          sx={{ fontWeight: 600, fontSize: '1rem', color: 'text.primary', flex: 1 }}
        >
          {title}
        </Typography>
        {/* Active model badge */}
        {selectedModel ? (
          <Box
            sx={{
              px: 1.5,
              py: 0.4,
              borderRadius: 10,
              background: 'rgba(251,191,36,0.1)',
              border: '1px solid rgba(251,191,36,0.25)',
              color: '#fbbf24',
              fontSize: '0.7rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexShrink: 0,
            }}
            title={selectedModel}
          >
            {selectedModel}
          </Box>
        ) : (
          <Box
            sx={{
              px: 1.5,
              py: 0.4,
              borderRadius: 10,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171',
              fontSize: '0.7rem',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            ⚠ No model selected
          </Box>
        )}
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        {isLoading && messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">Loading messages…</Typography>
          </Box>
        ) : messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box sx={{ fontSize: '2.5rem', opacity: 0.3 }}>💬</Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', opacity: 0.6 }}>
              No messages yet — start the conversation!
            </Typography>
          </Box>
        ) : (
          messages.map(msg => <MessageBubble key={msg.id} message={msg} />)
        )}
        {isSending && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(255, 255, 255, 0.015)',
          flexShrink: 0,
        }}
      >
        {/* No-model warning banner */}
        {!canSend && (
          <Box
            sx={{
              mb: 1.5,
              px: 2,
              py: 1,
              borderRadius: 2,
              background: 'rgba(239,68,68,0.07)',
              border: '1px solid rgba(239,68,68,0.18)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: '#f87171', fontSize: '0.75rem' }}>
              ⚙️ Open <strong>Settings</strong> and select a model to start chatting.
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 1.5,
            p: 1.5,
            borderRadius: 3,
            border: `1px solid ${canSend ? 'rgba(255, 255, 255, 0.08)' : 'rgba(239,68,68,0.15)'}`,
            background: canSend ? 'rgba(255, 255, 255, 0.03)' : 'rgba(239,68,68,0.03)',
            transition: 'border-color 0.25s, box-shadow 0.25s',
            '&:focus-within': canSend ? {
              borderColor: 'rgba(251, 191, 36, 0.3)',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.06)',
            } : {},
          }}
        >
          <TextField
            multiline
            minRows={1}
            maxRows={6}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={canSend ? 'Type your message…' : 'Select a model in Settings first…'}
            variant="standard"
            fullWidth
            disabled={!canSend}
            slotProps={{
              input: {
                disableUnderline: true,
                sx: {
                  color: 'text.primary',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: '0.938rem',
                  lineHeight: 1.6,
                  p: 0,
                },
              },
            }}
            sx={{
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.25)',
                opacity: 1,
              },
            }}
          />

          {/* Send Button */}
          <Box
            onClick={handleSend}
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: input.trim() && canSend
                ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                : 'rgba(255, 255, 255, 0.06)',
              color: input.trim() && canSend ? '#0a0a0f' : 'rgba(255, 255, 255, 0.2)',
              cursor: input.trim() && canSend ? 'pointer' : 'default',
              transition: 'all 0.25s ease',
              fontWeight: 700,
              fontSize: '1.2rem',
              '&:hover': input.trim() && canSend
                ? {
                    boxShadow: '0 0 24px rgba(251, 191, 36, 0.3)',
                    transform: 'scale(1.06)',
                  }
                : {},
            }}
          >
            ➤
          </Box>
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 1,
            color: 'text.secondary',
            fontSize: '0.68rem',
            opacity: 0.4,
          }}
        >
          Enter to send · Shift + Enter for new line
        </Typography>
      </Box>
    </Box>
  );
}
