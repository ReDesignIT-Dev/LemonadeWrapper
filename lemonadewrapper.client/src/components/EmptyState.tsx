import { Box, Typography, Button } from '@mui/material';
import { keyframes } from '@emotion/react';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

interface EmptyStateProps {
  onNewChat: () => void;
}

export default function EmptyState({ onNewChat }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        gap: 3,
        userSelect: 'none',
      }}
    >
      <Box
        sx={{
          fontSize: '5rem',
          animation: `${float} 3s ease-in-out infinite`,
          filter: 'drop-shadow(0 8px 24px rgba(251, 191, 36, 0.15))',
        }}
      >
        🍋
      </Box>

      <Typography
        variant="h4"
        sx={{
          background: 'linear-gradient(135deg, #fcd34d 0%, #fbbf24 30%, #f59e0b 70%, #fcd34d 100%)',
          backgroundSize: '200% auto',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: `${shimmer} 4s linear infinite`,
        }}
      >
        Lemonade Wrapper
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          textAlign: 'center',
          maxWidth: 380,
          lineHeight: 1.7,
        }}
      >
        Your AI conversations, preserved and always accessible.
        <br />
        Start a new chat to begin.
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={onNewChat}
        sx={{
          mt: 1,
          px: 4,
          py: 1.5,
          fontSize: '0.95rem',
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          color: '#0a0a0f',
          fontWeight: 700,
          borderRadius: 3,
          transition: 'all 0.25s ease',
          '&:hover': {
            background: 'linear-gradient(135deg, #fcd34d, #fbbf24)',
            boxShadow: '0 0 28px rgba(251, 191, 36, 0.25)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        + New Chat
      </Button>
    </Box>
  );
}
