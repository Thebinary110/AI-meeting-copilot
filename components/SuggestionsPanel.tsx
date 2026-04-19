'use client';

import { useSessionStore } from '../store/session';
import { useSuggestionLoop } from '../hooks/useSuggestionLoop';
import SuggestionCard from './SuggestionCard';
import { useChatStream } from '../hooks/useChatStream';
import type { Suggestion } from '../types';

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString();
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
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 flex-shrink-0">
        <span className="text-sm font-medium text-zinc-300">Live Suggestions</span>
        <button
          onClick={() => void fetchSuggestions('manual')}
          disabled={isLoadingSuggestions}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 disabled:opacity-50 transition-colors"
          title="Refresh suggestions"
        >
          <span className={isLoadingSuggestions ? 'animate-spin inline-block' : ''}>↻</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6">
        {reversed.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-500 text-sm text-center">
              Suggestions appear here during your conversation
            </p>
          </div>
        ) : (
          reversed.map((batch, i) => {
            const isNewest = i === 0;
            return (
              <div
                key={batch.id}
                className={`space-y-3 ${!isNewest ? 'opacity-70' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">{formatTimestamp(batch.timestamp)}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-400">
                    {batch.trigger === 'manual' ? 'manual refresh' : 'auto'}
                  </span>
                  {isNewest && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-400 border border-emerald-700/50 font-medium">
                      NEW
                    </span>
                  )}
                </div>
                {batch.suggestions.map((s) => (
                  <SuggestionCard
                    key={s.id}
                    suggestion={s}
                    onSelect={(suggestion) => handleSelect(batch.id, suggestion)}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
