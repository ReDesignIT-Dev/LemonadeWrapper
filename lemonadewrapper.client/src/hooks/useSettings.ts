import { useState, useCallback, useEffect } from 'react';
import * as api from '../services/api';

const SETTINGS_STORAGE_KEY = 'lemonade-settings';
const SETTINGS_API = '/LemonadeServer/settings';

export interface LemonadeSettings {
  aiServerUrl: string;
  apiKey: string;
  selectedModel: string;
}

const defaultSettings: LemonadeSettings = {
  aiServerUrl: '',
  apiKey: '',
  selectedModel: '',
};

/** Read last-saved values from localStorage for instant paint on load. */
function loadFromCache(): LemonadeSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultSettings, ...parsed };
    }
  } catch {
    // ignore
  }
  return defaultSettings;
}

function saveToCache(settings: LemonadeSettings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function useSettings() {
  // Initialise from localStorage so there is no flicker on first paint
  const [settings, setSettings] = useState<LemonadeSettings>(loadFromCache);
  const [isOpen, setIsOpen] = useState(false);

  // On mount, fetch the authoritative settings from the server file.
  // This overwrites the cache with whatever was last persisted to disk.
  useEffect(() => {
    fetch(SETTINGS_API)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load settings from server');
        return res.json() as Promise<{ aiServerUrl: string; apiKey: string; selectedModel: string }>;
      })
      .then(data => {
        const loaded: LemonadeSettings = {
          aiServerUrl: data.aiServerUrl ?? '',
          apiKey: data.apiKey ?? '',
          selectedModel: data.selectedModel ?? '',
        };
        setSettings(loaded);
        saveToCache(loaded);
      })
      .catch(() => {
        // Server unreachable — stay with whatever is in localStorage
      });
  }, []);

  const updateSettings = useCallback((newSettings: LemonadeSettings) => {
    setSettings(newSettings);
    saveToCache(newSettings);

    // Persist to the server file so settings survive any browser reset
    fetch(SETTINGS_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        aiServerUrl: newSettings.aiServerUrl,
        apiKey: newSettings.apiKey,
        selectedModel: newSettings.selectedModel,
      }),
    }).catch(() => {
      // Best-effort — localStorage copy is still up-to-date as a fallback
    });
  }, []);

  const openSettings = useCallback(() => setIsOpen(true), []);
  const closeSettings = useCallback(() => setIsOpen(false), []);

  /** True only when URL, key, AND a model are all selected. */
  const isConfigured = !!(
    settings.aiServerUrl.trim() &&
    settings.apiKey.trim() &&
    settings.selectedModel.trim()
  );

  return {
    settings,
    updateSettings,
    isOpen,
    openSettings,
    closeSettings,
    isConfigured,
  };
}
