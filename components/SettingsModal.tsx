'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/settings';
import type { SuggestionType } from '../types';

const ALL_TYPES: SuggestionType[] = [
  'QUESTION_TO_ASK',
  'FACT_CHECK',
  'TALKING_POINT',
  'CLARIFICATION',
  'ANSWER_PROVIDED',
  'FOLLOWUP',
];

const TYPE_LABELS: Record<SuggestionType, string> = {
  QUESTION_TO_ASK: 'Question To Ask',
  FACT_CHECK: 'Fact Check',
  TALKING_POINT: 'Talking Point',
  CLARIFICATION: 'Clarification',
  ANSWER_PROVIDED: 'Answer Provided',
  FOLLOWUP: 'Followup',
};

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps): JSX.Element {
  const store = useSettingsStore();

  const [suggestionPrompt, setSuggestionPrompt] = useState(store.suggestionPrompt);
  const [chatPrompt, setChatPrompt] = useState(store.chatPrompt);
  const [suggestionContextWords, setSuggestionContextWords] = useState(
    store.suggestionContextWords
  );
  const [chatContextWords, setChatContextWords] = useState(store.chatContextWords);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState(
    Math.round(store.refreshIntervalMs / 1000)
  );
  const [enabledTypes, setEnabledTypes] = useState<SuggestionType[]>(
    store.enabledSuggestionTypes
  );

  const hasApiKey = Boolean(process.env.NEXT_PUBLIC_GROQ_API_KEY);

  useEffect(() => {
    setSuggestionPrompt(store.suggestionPrompt);
    setChatPrompt(store.chatPrompt);
    setSuggestionContextWords(store.suggestionContextWords);
    setChatContextWords(store.chatContextWords);
    setRefreshIntervalSec(Math.round(store.refreshIntervalMs / 1000));
    setEnabledTypes(store.enabledSuggestionTypes);
  }, [store]);

  const handleSave = (): void => {
    store.updateSetting('suggestionPrompt', suggestionPrompt);
    store.updateSetting('chatPrompt', chatPrompt);
    store.updateSetting('suggestionContextWords', suggestionContextWords);
    store.updateSetting('chatContextWords', chatContextWords);
    store.updateSetting('refreshIntervalMs', refreshIntervalSec * 1000);
    store.updateSetting('enabledSuggestionTypes', enabledTypes);
    onClose();
  };

  const handleReset = (): void => {
    store.resetToDefaults();
  };

  const toggleType = (type: SuggestionType): void => {
    setEnabledTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">API Configuration</h3>
            <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg">
              <span className="text-xs text-zinc-400">
                API key loaded from .env.local (NEXT_PUBLIC_GROQ_API_KEY)
              </span>
              {hasApiKey ? (
                <span className="text-emerald-400 text-sm ml-auto">✓</span>
              ) : (
                <span className="text-red-400 text-xs ml-auto">
                  Missing — set NEXT_PUBLIC_GROQ_API_KEY in .env.local
                </span>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Suggestion Prompt</h3>
            <textarea
              rows={12}
              value={suggestionPrompt}
              onChange={(e) => setSuggestionPrompt(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 resize-none outline-none focus:border-zinc-500 font-mono"
            />
          </section>

          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Chat Prompt</h3>
            <textarea
              rows={8}
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 resize-none outline-none focus:border-zinc-500 font-mono"
            />
          </section>

          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Context Windows</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">
                  Suggestion context (words)
                </label>
                <input
                  type="number"
                  value={suggestionContextWords}
                  onChange={(e) => setSuggestionContextWords(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">
                  Chat context (words)
                </label>
                <input
                  type="number"
                  value={chatContextWords}
                  onChange={(e) => setChatContextWords(Number(e.target.value))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Refresh Interval</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={refreshIntervalSec}
                onChange={(e) => setRefreshIntervalSec(Number(e.target.value))}
                className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-zinc-500"
              />
              <span className="text-xs text-zinc-400">seconds</span>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">
              Enabled Suggestion Types
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {ALL_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={enabledTypes.includes(type)}
                    onChange={() => toggleType(type)}
                    className="rounded"
                  />
                  <span className="text-sm text-zinc-300">{TYPE_LABELS[type]}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg font-medium transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
