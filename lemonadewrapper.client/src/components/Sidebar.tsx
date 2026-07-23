import { Box, Typography, TextField } from '@mui/material';
import { useState } from 'react';
import { keyframes } from '@emotion/react';
import type { ChatSession } from '../types/chat';

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
`;

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  getTitle: (sessionId: string) => string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onRenameSession: (sessionId: string, title: string) => void;
  onOpenSettings: () => void;
  isConfigured: boolean;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export default function Sidebar({
  sessions,
  activeSessionId,
  getTitle,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onOpenSettings,
  isConfigured,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const startRename = (sessionId: string) => {
    setEditingId(sessionId);
    setEditValue(getTitle(sessionId));
  };

  const finishRename = () => {
    if (editingId && editValue.trim()) {
      onRenameSession(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <Box
      sx={{
        width: 280,
        minWidth: 280,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0d0d14',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <Box sx={{ fontSize: '1.6rem', lineHeight: 1 }}>🍋</Box>
        <Typography
          variant="h6"
          sx={{
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            fontSize: '1.15rem',
          }}
        >
          Lemonade
        </Typography>
      </Box>

      {/* New Chat Button */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Box
          onClick={onNewSession}
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            cursor: 'pointer',
            border: '1px dashed rgba(251, 191, 36, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            color: '#fbbf24',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'all 0.25s ease',
            '&:hover': {
              border: '1px dashed rgba(251, 191, 36, 0.6)',
              background: 'rgba(251, 191, 36, 0.05)',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.08)',
            },
          }}
        >
          + New Chat
        </Box>
      </Box>

      {/* Session List */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, pb: 2, pt: 0.5 }}>
        {sessions.length === 0 && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              textAlign: 'center',
              mt: 4,
              opacity: 0.6,
            }}
          >
            No conversations yet
          </Typography>
        )}

        {sessions.map((session, index) => {
          const isActive = session.sessionId === activeSessionId;
          const isEditing = editingId === session.sessionId;

          return (
            <Box
              key={session.sessionId}
              onClick={() => !isEditing && onSelectSession(session.sessionId)}
              onDoubleClick={() => startRename(session.sessionId)}
              sx={{
                p: 1.5,
                mb: 0.5,
                borderRadius: 2,
                cursor: 'pointer',
                animation: `${slideIn} 0.3s ease-out ${index * 0.04}s both`,
                background: isActive ? 'rgba(251, 191, 36, 0.08)' : 'transparent',
                borderLeft: isActive
                  ? '3px solid #fbbf24'
                  : '3px solid transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: isActive
                    ? 'rgba(251, 191, 36, 0.12)'
                    : 'rgba(255, 255, 255, 0.03)',
                  '& .edit-hint': { opacity: 0.5 },
                },
              }}
            >
              {isEditing ? (
                <TextField
                  size="small"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={finishRename}
                  onKeyDown={e => {
                    if (e.key === 'Enter') finishRename();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  autoFocus
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: '0.85rem',
                      py: 0.5,
                      px: 1,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(251, 191, 36, 0.3)',
                    },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(251, 191, 36, 0.5)',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#fbbf24',
                    },
                  }}
                />
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#fbbf24' : 'text.primary',
                        transition: 'color 0.2s',
                      }}
                    >
                      {getTitle(session.sessionId)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.68rem',
                        opacity: 0.7,
                      }}
                    >
                      {formatRelativeTime(session.updatedAt)}
                    </Typography>
                  </Box>

                  {/* Edit hint */}
                  <Box
                    className="edit-hint"
                    onClick={e => {
                      e.stopPropagation();
                      startRename(session.sessionId);
                    }}
                    sx={{
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      p: '2px 4px',
                      borderRadius: 1,
                      flexShrink: 0,
                      '&:hover': {
                        opacity: '1 !important',
                        background: 'rgba(255, 255, 255, 0.08)',
                      },
                    }}
                  >
                    ✏️
                  </Box>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', opacity: 0.4, fontSize: '0.68rem' }}
        >
          Double-click to rename
        </Typography>
        <Box
          onClick={onOpenSettings}
          sx={{
            position: 'relative',
            width: 36,
            height: 36,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.15rem',
            transition: 'all 0.25s ease',
            color: 'text.secondary',
            '&:hover': {
              background: 'rgba(251, 191, 36, 0.08)',
              color: '#fbbf24',
              transform: 'rotate(45deg)',
            },
          }}
        >
          ⚙️
          {isConfigured && (
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#34d399',
                boxShadow: '0 0 6px rgba(52, 211, 153, 0.5)',
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
