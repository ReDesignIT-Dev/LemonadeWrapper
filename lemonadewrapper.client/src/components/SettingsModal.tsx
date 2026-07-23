import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  MenuItem,
  CircularProgress,
  Chip,
} from '@mui/material';
import type { LemonadeSettings } from '../hooks/useSettings';
import { fetchModels } from '../services/api';

interface SettingsModalProps {
  open: boolean;
  settings: LemonadeSettings;
  onSave: (settings: LemonadeSettings) => void;
  onClose: () => void;
}

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(251, 191, 36, 0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#fbbf24' },
  },
  '& .MuiInputLabel-root': {
    color: 'text.secondary',
    '&.Mui-focused': { color: '#fbbf24' },
  },
  '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.4)' },
};

export default function SettingsModal({ open, settings, onSave, onClose }: SettingsModalProps) {
  const [url, setUrl] = useState(settings.aiServerUrl);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [selectedModel, setSelectedModel] = useState(settings.selectedModel);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  // Sync local state when the modal opens
  useEffect(() => {
    if (open) {
      setUrl(settings.aiServerUrl);
      setApiKey(settings.apiKey);
      setSelectedModel(settings.selectedModel);
      setSaved(false);
      setShowKey(false);
      setModelsError(null);

      // If we already have a URL and key, pre-load models so the dropdown is ready
      if (settings.aiServerUrl.trim() && settings.apiKey.trim()) {
        loadModels(settings.aiServerUrl.trim(), settings.apiKey.trim());
      } else {
        setModels([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadModels = async (targetUrl: string, targetKey: string) => {
    setModelsLoading(true);
    setModelsError(null);
    setModels([]);
    setSelectedModel('');
    try {
      const list = await fetchModels(targetUrl, targetKey);
      setModels(list);
      if (list.length === 1) setSelectedModel(list[0]);
    } catch (e) {
      setModelsError(e instanceof Error ? e.message : 'Could not fetch models');
    } finally {
      setModelsLoading(false);
    }
  };

  const handleConnect = () => {
    if (url.trim() && apiKey.trim()) {
      loadModels(url.trim(), apiKey.trim());
    }
  };

  const canConnect = url.trim().length > 0 && apiKey.trim().length > 0;
  const canSave = canConnect && selectedModel.trim().length > 0;

  const handleSave = () => {
    onSave({ aiServerUrl: url.trim(), apiKey: apiKey.trim(), selectedModel: selectedModel.trim() });
    setSaved(true);
    setTimeout(() => onClose(), 600);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            background: 'linear-gradient(160deg, #13131c 0%, #0d0d14 100%)',
            border: '1px solid rgba(251, 191, 36, 0.12)',
            borderRadius: 3,
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(251, 191, 36, 0.06)',
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box sx={{ fontSize: '1.4rem', lineHeight: 1 }}>⚙️</Box>
        <Typography
          variant="h6"
          component="span"
          sx={{
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            fontSize: '1.1rem',
          }}
        >
          Server Settings
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: '16px !important' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '0.82rem' }}>
          Enter your AI server URL and API key, then click <strong>Connect</strong> to load available models.
        </Typography>

        {/* URL */}
        <TextField
          label="AI Server URL"
          placeholder="http://172.16.0.16:13305"
          value={url}
          onChange={e => { setUrl(e.target.value); setModels([]); setModelsError(null); }}
          fullWidth
          variant="outlined"
          sx={{ mb: 2.5, ...textFieldSx }}
        />

        {/* API Key */}
        <TextField
          label="API Key"
          placeholder="Enter your API key"
          value={apiKey}
          onChange={e => { setApiKey(e.target.value); setModels([]); setModelsError(null); }}
          fullWidth
          variant="outlined"
          type={showKey ? 'text' : 'password'}
          sx={{ mb: 2, ...textFieldSx }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowKey(!showKey)}
                    edge="end"
                    size="small"
                    sx={{ color: 'text.secondary' }}
                  >
                    {showKey ? '🙈' : '👁️'}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Connect button */}
        <Button
          onClick={handleConnect}
          disabled={!canConnect || modelsLoading}
          variant="outlined"
          fullWidth
          sx={{
            mb: 2.5,
            borderColor: 'rgba(251,191,36,0.35)',
            color: '#fbbf24',
            borderRadius: 2,
            py: 1,
            '&:hover': {
              borderColor: '#fbbf24',
              background: 'rgba(251,191,36,0.06)',
            },
            '&.Mui-disabled': {
              borderColor: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.2)',
            },
          }}
          startIcon={modelsLoading ? <CircularProgress size={16} sx={{ color: '#fbbf24' }} /> : null}
        >
          {modelsLoading ? 'Connecting…' : 'Connect & Fetch Models'}
        </Button>

        {/* Error */}
        {modelsError && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 2,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
            }}
          >
            <Typography variant="body2" sx={{ color: '#f87171', fontSize: '0.8rem' }}>
              ⚠️ {modelsError}
            </Typography>
          </Box>
        )}

        {/* Model picker */}
        {models.length > 0 && (
          <Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', mb: 1, display: 'block', fontSize: '0.75rem' }}
            >
              {models.length} model{models.length !== 1 ? 's' : ''} available — select one to use:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {models.map(m => (
                <Chip
                  key={m}
                  label={m}
                  onClick={() => setSelectedModel(m)}
                  variant={selectedModel === m ? 'filled' : 'outlined'}
                  sx={{
                    cursor: 'pointer',
                    borderColor: selectedModel === m ? '#fbbf24' : 'rgba(255,255,255,0.15)',
                    background: selectedModel === m
                      ? 'linear-gradient(135deg, rgba(251,191,36,0.25), rgba(245,158,11,0.15))'
                      : 'transparent',
                    color: selectedModel === m ? '#fbbf24' : 'text.secondary',
                    fontWeight: selectedModel === m ? 600 : 400,
                    fontSize: '0.78rem',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#fbbf24',
                      background: 'rgba(251,191,36,0.1)',
                    },
                  }}
                />
              ))}
            </Box>
            {selectedModel && (
              <Typography
                variant="caption"
                sx={{ mt: 1, display: 'block', color: '#fbbf24', fontSize: '0.72rem', opacity: 0.8 }}
              >
                ✓ Selected: {selectedModel}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'text.secondary',
            '&:hover': { background: 'rgba(255, 255, 255, 0.05)' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!canSave}
          variant="contained"
          sx={{
            background: saved
              ? 'linear-gradient(135deg, #34d399, #10b981)'
              : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            color: '#0a0a0f',
            fontWeight: 700,
            px: 3,
            '&:hover': {
              background: saved
                ? 'linear-gradient(135deg, #34d399, #10b981)'
                : 'linear-gradient(135deg, #fcd34d, #fbbf24)',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.2)',
            },
            '&.Mui-disabled': {
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'rgba(255, 255, 255, 0.2)',
            },
          }}
        >
          {saved ? '✓ Saved' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
