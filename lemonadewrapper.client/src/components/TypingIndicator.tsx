import { Box } from '@mui/material';
import { keyframes } from '@emotion/react';

const bounce = keyframes`
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
`;

export default function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, px: 2.5, py: 0.5 }}>
      {/* Avatar */}
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(251, 191, 36, 0.1)',
          fontSize: '1rem',
          flexShrink: 0,
          mt: 0.5,
        }}
      >
        🍋
      </Box>

      {/* Dots */}
      <Box
        sx={{
          display: 'flex',
          gap: '5px',
          alignItems: 'center',
          p: '12px 18px',
          borderRadius: '16px 16px 16px 4px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        {[0, 1, 2].map(i => (
          <Box
            key={i}
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#fbbf24',
              animation: `${bounce} 1.4s ease-in-out ${i * 0.16}s infinite`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
