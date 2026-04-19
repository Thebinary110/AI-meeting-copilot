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
  FOLLOWUP: 'Follow-up',
};

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps): JSX.Element {
  const store = useSettingsStore();

  const [groqApiKey, setGroqApiKey] = useState(store.groqApiKey);
  const [showKey, setShowKey] = useState(false);
  const [suggestionPrompt, setSuggestionPrompt] = useState(store.suggestionPrompt);
  const [chatPrompt, setChatPrompt] = useState(store.chatPrompt);
  const [suggestionContextWords, setSuggestionContextWords] = useState(store.suggestionContextWords);
  const [chatContextWords, setChatContextWords] = useState(store.chatContextWords);
  const [refreshIntervalSec, setRefreshIntervalSec] = useState(Math.round(store.refreshIntervalMs / 1000));
  const [enabledTypes, setEnabledTypes] = useState<SuggestionType[]>(store.enabledSuggestionTypes);

  useEffect(() => {
    setGroqApiKey(store.groqApiKey);
    setSuggestionPrompt(store.suggestionPrompt);
    setChatPrompt(store.chatPrompt);
    setSuggestionContextWords(store.suggestionContextWords);
    setChatContextWords(store.chatContextWords);
    setRefreshIntervalSec(Math.round(store.refreshIntervalMs / 1000));
    setEnabledTypes(store.enabledSuggestionTypes);
  }, [store]);

  const handleSave = (): void => {
    store.updateSetting('groqApiKey', groqApiKey.trim());
    store.updateSetting('suggestionPrompt', suggestionPrompt);
    store.updateSetting('chatPrompt', chatPrompt);
    store.updateSetting('suggestionContextWords', suggestionContextWords);
    store.updateSetting('chatContextWords', chatContextWords);
    store.updateSetting('refreshIntervalMs', refreshIntervalSec * 1000);
    store.updateSetting('enabledSuggestionTypes', enabledTypes);
    onClose();
  };

  const toggleType = (type: SuggestionType): void => {
    setEnabledTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#111] border border-[#222] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1c1c1c]">
          <h2 className="text-sm font-medium text-[#e0e0e0]">Settings</h2>
          <button onClick={onClose} className="text-[#555] hover:text-[#aaa] transition-colors text-lg leading-none">
            ×
          </button>
        </div>

        <div className="px-5 py-5 space-y-6">
          <section>
            <h3 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-3">Groq API Key</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                  placeholder="gsk_…"
                  className="flex-1 bg-[#0c0c0c] border border-[#222] focus:border-[#333] rounded-lg px-3 py-2 text-sm text-[#e0e0e0] outline-none font-mono placeholder-[#3a3a3a] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="h-9 px-3 text-xs text-[#666] border border-[#222] hover:border-[#333] rounded-lg transition-colors flex-shrink-0"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
                <span className={`text-sm flex-shrink-0 ${groqApiKey.trim() ? 'text-[#4a8a4a]' : 'text-[#3a3a3a]'}`}>
                  {groqApiKey.trim() ? '✓' : '○'}
                </span>
              </div>
              <p className="text-xs text-[#555]">
                Get a free key at{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4f8ef7] hover:text-[#7aabff] underline"
                >
                  console.groq.com/keys
                </a>
                . Stored locally — never sent anywhere except Groq.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-3">Suggestion Prompt</h3>
            <textarea
              rows={10}
              value={suggestionPrompt}
              onChange={(e) => setSuggestionPrompt(e.target.value)}
              className="w-full bg-[#0c0c0c] border border-[#222] focus:border-[#333] rounded-lg px-3 py-2 text-xs text-[#c0c0c0] resize-none outline-none font-mono transition-colors"
            />
          </section>

          <section>
            <h3 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-3">Chat Prompt</h3>
            <textarea
              rows={6}
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              className="w-full bg-[#0c0c0c] border border-[#222] focus:border-[#333] rounded-lg px-3 py-2 text-xs text-[#c0c0c0] resize-none outline-none font-mono transition-colors"
            />
          </section>

          <section>
            <h3 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-3">Context Windows</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#555] mb-1.5 block">Suggestions (words)</label>
                <input
                  type="number"
                  value={suggestionContextWords}
                  onChange={(e) => setSuggestionContextWords(Number(e.target.value))}
                  className="w-full bg-[#0c0c0c] border border-[#222] focus:border-[#333] rounded-lg px-3 py-2 text-sm text-[#e0e0e0] outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[#555] mb-1.5 block">Chat (words)</label>
                <input
                  type="number"
                  value={chatContextWords}
                  onChange={(e) => setChatContextWords(Number(e.target.value))}
                  className="w-full bg-[#0c0c0c] border border-[#222] focus:border-[#333] rounded-lg px-3 py-2 text-sm text-[#e0e0e0] outline-none transition-colors"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-3">Auto-refresh Interval</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={refreshIntervalSec}
                onChange={(e) => setRefreshIntervalSec(Number(e.target.value))}
                className="w-20 bg-[#0c0c0c] border border-[#222] focus:border-[#333] rounded-lg px-3 py-2 text-sm text-[#e0e0e0] outline-none transition-colors"
              />
              <span className="text-xs text-[#555]">seconds</span>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-medium text-[#888] uppercase tracking-wider mb-3">Suggestion Types</h3>
            <div className="grid grid-cols-2 gap-2">
              {ALL_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={enabledTypes.includes(type)}
                    onChange={() => toggleType(type)}
                    className="accent-[#4f8ef7]"
                  />
                  <span className="text-sm text-[#888] group-hover:text-[#bbb] transition-colors">
                    {TYPE_LABELS[type]}
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#1c1c1c]">
          <button
            onClick={() => store.resetToDefaults()}
            className="text-xs text-[#555] hover:text-[#888] transition-colors"
          >
            Reset to defaults
          </button>
          <button
            onClick={handleSave}
            className="h-8 px-4 bg-[#1a2234] hover:bg-[#1e2a40] border border-[#1e2e48] text-[#6090c8] text-xs rounded-lg font-medium transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
