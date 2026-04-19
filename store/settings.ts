'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '../types';
import {
  DEFAULT_GROQ_API_KEY,
  DEFAULT_SUGGESTION_PROMPT,
  DEFAULT_CHAT_PROMPT,
  DEFAULT_SUGGESTION_CONTEXT_WORDS,
  DEFAULT_CHAT_CONTEXT_WORDS,
  DEFAULT_REFRESH_INTERVAL_MS,
  DEFAULT_ENABLED_SUGGESTION_TYPES,
} from '../lib/prompts';

const defaultSettings: Settings = {
  groqApiKey: DEFAULT_GROQ_API_KEY,
  suggestionPrompt: DEFAULT_SUGGESTION_PROMPT,
  chatPrompt: DEFAULT_CHAT_PROMPT,
  suggestionContextWords: DEFAULT_SUGGESTION_CONTEXT_WORDS,
  chatContextWords: DEFAULT_CHAT_CONTEXT_WORDS,
  refreshIntervalMs: DEFAULT_REFRESH_INTERVAL_MS,
  enabledSuggestionTypes: DEFAULT_ENABLED_SUGGESTION_TYPES,
};

interface SettingsState extends Settings {
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetToDefaults: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateSetting: (key, value) => set({ [key]: value }),

      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'twinmind-settings',
      skipHydration: true,
    }
  )
);
