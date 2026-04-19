'use client';

import { create } from 'zustand';
import type {
  TranscriptChunk,
  SuggestionBatch,
  ChatMessage,
  SessionExport,
} from '../types';

interface SessionState {
  transcript: TranscriptChunk[];
  suggestionBatches: SuggestionBatch[];
  chatHistory: ChatMessage[];
  isRecording: boolean;
  isLoadingSuggestions: boolean;
  isLoadingChat: boolean;
  sessionStartTime: string | null;
  errorMessage: string | null;

  appendTranscriptChunk: (chunk: TranscriptChunk) => void;
  addSuggestionBatch: (batch: SuggestionBatch) => void;
  markSuggestionClicked: (batchId: string, suggestionId: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  updateStreamingMessage: (id: string, appendedContent: string) => void;
  finalizeStreamingMessage: (id: string) => void;
  setRecording: (value: boolean) => void;
  setLoadingSuggestions: (value: boolean) => void;
  setLoadingChat: (value: boolean) => void;
  setError: (msg: string | null) => void;
  resetSession: () => void;
  exportSession: () => SessionExport;
}

const initialState = {
  transcript: [],
  suggestionBatches: [],
  chatHistory: [],
  isRecording: false,
  isLoadingSuggestions: false,
  isLoadingChat: false,
  sessionStartTime: null,
  errorMessage: null,
};

export const useSessionStore = create<SessionState>((set, get) => ({
  ...initialState,

  appendTranscriptChunk: (chunk) =>
    set((state) => ({
      transcript: [...state.transcript, chunk],
      sessionStartTime: state.sessionStartTime ?? chunk.timestamp,
    })),

  addSuggestionBatch: (batch) =>
    set((state) => ({
      suggestionBatches: [...state.suggestionBatches, batch],
    })),

  markSuggestionClicked: (batchId, suggestionId) =>
    set((state) => ({
      suggestionBatches: state.suggestionBatches.map((b) =>
        b.id === batchId
          ? {
              ...b,
              suggestions: b.suggestions.map((s) =>
                s.id === suggestionId ? { ...s, clicked: true } : s
              ),
            }
          : b
      ),
    })),

  addChatMessage: (message) =>
    set((state) => ({ chatHistory: [...state.chatHistory, message] })),

  updateStreamingMessage: (id, appendedContent) =>
    set((state) => ({
      chatHistory: state.chatHistory.map((m) =>
        m.id === id ? { ...m, content: m.content + appendedContent } : m
      ),
    })),

  finalizeStreamingMessage: (id) =>
    set((state) => ({
      chatHistory: state.chatHistory.map((m) =>
        m.id === id ? { ...m, isStreaming: false } : m
      ),
      isLoadingChat: false,
    })),

  setRecording: (value) => set({ isRecording: value }),
  setLoadingSuggestions: (value) => set({ isLoadingSuggestions: value }),
  setLoadingChat: (value) => set({ isLoadingChat: value }),
  setError: (msg) => set({ errorMessage: msg }),

  resetSession: () => set(initialState),

  exportSession: () => {
    const state = get();
    const now = new Date();
    const startTime = state.sessionStartTime
      ? new Date(state.sessionStartTime)
      : now;
    const durationSeconds = Math.floor(
      (now.getTime() - startTime.getTime()) / 1000
    );
    return {
      exported_at: now.toISOString(),
      session_duration_seconds: durationSeconds,
      transcript: state.transcript,
      suggestion_batches: state.suggestionBatches,
      chat_history: state.chatHistory,
    };
  },
}));
