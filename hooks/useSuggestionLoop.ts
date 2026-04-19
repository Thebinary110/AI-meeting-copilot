'use client';

import { useEffect, useCallback, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import { useSessionStore } from '../store/session';
import { useSettingsStore } from '../store/settings';
import { getTranscriptWindow } from '../lib/context-window';
import type { SuggestionBatch, Suggestion } from '../types';

interface SuggestionRaw {
  id: string;
  type: string;
  preview: string;
  detailPrompt: string;
  clicked: boolean;
}

interface UseSuggestionLoopReturn {
  fetchSuggestions: (trigger: 'auto' | 'manual') => Promise<void>;
}

export function useSuggestionLoop(): UseSuggestionLoopReturn {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    transcript,
    suggestionBatches,
    isRecording,
    isLoadingSuggestions,
    addSuggestionBatch,
    setLoadingSuggestions,
    setError,
  } = useSessionStore();

  const settings = useSettingsStore();

  const fetchSuggestions = useCallback(
    async (trigger: 'auto' | 'manual'): Promise<void> => {
      if (isLoadingSuggestions) return;
      if (transcript.length === 0) return;

      setLoadingSuggestions(true);

      try {
        const transcriptWindow = getTranscriptWindow(
          transcript,
          settings.suggestionContextWords
        );

        const lastBatch = suggestionBatches[suggestionBatches.length - 1];
        const previousSuggestions = lastBatch
          ? lastBatch.suggestions.map((s) => s.preview)
          : [];

        const res = await fetch('/api/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: settings.groqApiKey,
            transcriptWindow,
            previousSuggestions,
            prompt: settings.suggestionPrompt,
          }),
        });

        const data = await res.json() as { suggestions?: SuggestionRaw[]; error?: string };

        if (data.error) {
          setError('Suggestions failed — will retry next cycle');
          return;
        }

        if (data.suggestions && data.suggestions.length > 0) {
          const filtered = data.suggestions.filter((s) =>
            settings.enabledSuggestionTypes.includes(s.type as Suggestion['type'])
          );

          const batch: SuggestionBatch = {
            id: uuid(),
            timestamp: new Date().toISOString(),
            trigger,
            suggestions: filtered.map((s) => ({
              id: s.id,
              type: s.type as Suggestion['type'],
              preview: s.preview,
              detailPrompt: s.detailPrompt,
              clicked: false,
            })),
          };

          addSuggestionBatch(batch);
        }
      } catch {
        setError('Suggestions failed — will retry next cycle');
      } finally {
        setLoadingSuggestions(false);
      }
    },
    [
      isLoadingSuggestions,
      transcript,
      suggestionBatches,
      settings,
      addSuggestionBatch,
      setLoadingSuggestions,
      setError,
    ]
  );

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        void fetchSuggestions('auto');
      }, settings.refreshIntervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRecording, settings.refreshIntervalMs, fetchSuggestions]);

  return { fetchSuggestions };
}
