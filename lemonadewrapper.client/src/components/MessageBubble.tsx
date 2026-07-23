import { Box, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';
import { useState } from 'react';
import type { ChatMessage } from '../types/chat';

const fadeSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.isUserMessage;
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API may fail in non-secure contexts
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        animation: `${fadeSlideIn} 0.3s ease-out both`,
        px: 2.5,
        py: 0.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          maxWidth: '75%',
        }}
      >
        {/* Assistant avatar */}
        {!isUser && (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(251, 191, 36, 0.1)',
              fontSize: '1rem',
              mt: 0.5,
            }}
          >
            🍋
          </Box>
        )}

        {/* Bubble */}
        <Box
          sx={{
            position: 'relative',
            p: '10px 16px',
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            background: isUser
              ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
              : 'rgba(255, 255, 255, 0.05)',
            border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.04)',
            color: isUser ? '#0a0a0f' : 'text.primary',
            boxShadow: isUser
              ? '0 2px 12px rgba(251, 191, 36, 0.15)'
              : '0 1px 4px rgba(0, 0, 0, 0.2)',
            transition: 'box-shadow 0.2s',
          }}
        >
          <Typography
            variant="body1"
            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {message.content}
          </Typography>

          {/* Copy button (appears on hover) */}
          <Box
            onClick={handleCopy}
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              opacity: hovered ? 0.7 : 0,
              transition: 'opacity 0.2s',
              fontSize: '0.7rem',
              cursor: 'pointer',
              p: '2px 6px',
              borderRadius: '6px',
              background: isUser ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.08)',
              '&:hover': {
                opacity: 1,
                background: isUser ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.14)',
              },
            }}
          >
            {copied ? '✓' : '📋'}
          </Box>
        </Box>

        {/* User avatar */}
        {isUser && (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.1))',
              fontSize: '0.85rem',
              mt: 0.5,
              fontWeight: 700,
              color: '#fbbf24',
            }}
          >
            U
          </Box>
        )}
      </Box>

      {/* Timestamp (on hover) */}
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          opacity: hovered ? 0.6 : 0,
          transition: 'opacity 0.2s',
          mt: 0.3,
          mx: isUser ? 0 : 5.5,
          fontSize: '0.68rem',
        }}
      >
        {formattedTime}
      </Typography>
    </Box>
  );
}
