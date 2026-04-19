'use client';

import { useSessionStore } from '../store/session';
import { useSuggestionLoop } from '../hooks/useSuggestionLoop';
import SuggestionCard from './SuggestionCard';
import { useChatStream } from '../hooks/useChatStream';
import type { Suggestion } from '../types';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function SuggestionsPanel(): JSX.Element {
  const suggestionBatches = useSessionStore((s) => s.suggestionBatches);
  const isLoadingSuggestions = useSessionStore((s) => s.isLoadingSuggestions);
  const markSuggestionClicked = useSessionStore((s) => s.markSuggestionClicked);
  const { fetchSuggestions } = useSuggestionLoop();
  const { sendMessage } = useChatStream();

  const handleSelect = (batchId: string, suggestion: Suggestion): void => {
    markSuggestionClicked(batchId, suggestion.id);
    void sendMessage(suggestion.detailPrompt, 'suggestion_click');
  };

  const reversed = [...suggestionBatches].reverse();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-10 border-b border-[#1c1c1c] flex-shrink-0">
        <span className="text-xs font-medium text-[#888] uppercase tracking-wider">Suggestions</span>
        <button
          onClick={() => void fetchSuggestions('manual')}
          disabled={isLoadingSuggestions}
          className="flex items-center gap-1.5 h-6 px-2.5 rounded text-xs text-[#888] border border-[#222] hover:text-[#ccc] hover:border-[#333] disabled:opacity-30 transition-colors"
          title="Refresh suggestions"
        >
          <RefreshIcon spinning={isLoadingSuggestions} />
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 min-h-0">
        {reversed.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#444] text-xs text-center leading-relaxed">
              Suggestions appear here<br />while recording
            </p>
          </div>
        ) : (
          reversed.map((batch, i) => {
            const isNewest = i === 0;
            return (
              <div key={batch.id} className={isNewest ? '' : 'opacity-50'}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] tabular-nums text-[#444]">{formatTime(batch.timestamp)}</span>
                  {batch.trigger === 'manual' && (
                    <span className="text-[10px] text-[#444]">· manual</span>
                  )}
                  {isNewest && (
                    <span className="text-[10px] text-[#4f8ef7]">· new</span>
                  )}
                </div>
                <div className="space-y-2">
                  {batch.suggestions.map((s) => (
                    <SuggestionCard
                      key={s.id}
                      suggestion={s}
                      onSelect={(suggestion) => handleSelect(batch.id, suggestion)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }): JSX.Element {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={spinning ? 'animate-spin' : ''}
    >
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />
    </svg>
  );
}
