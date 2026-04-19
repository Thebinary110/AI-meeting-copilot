'use client';

import type { Suggestion, SuggestionType } from '../types';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onSelect: (suggestion: Suggestion) => void;
}

const TYPE_STYLES: Record<SuggestionType, { badge: string; label: string; icon: string }> = {
  QUESTION_TO_ASK: {
    badge: 'bg-blue-900/50 text-blue-300 border border-blue-700/50',
    label: 'Question To Ask',
    icon: '?',
  },
  FACT_CHECK: {
    badge: 'bg-amber-900/50 text-amber-300 border border-amber-700/50',
    label: 'Fact Check',
    icon: '✓',
  },
  TALKING_POINT: {
    badge: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50',
    label: 'Talking Point',
    icon: '◆',
  },
  CLARIFICATION: {
    badge: 'bg-purple-900/50 text-purple-300 border border-purple-700/50',
    label: 'Clarification',
    icon: '↔',
  },
  ANSWER_PROVIDED: {
    badge: 'bg-teal-900/50 text-teal-300 border border-teal-700/50',
    label: 'Answer Provided',
    icon: '▶',
  },
  FOLLOWUP: {
    badge: 'bg-zinc-700/50 text-zinc-300 border border-zinc-600/50',
    label: 'Followup',
    icon: '→',
  },
};

export default function SuggestionCard({ suggestion, onSelect }: SuggestionCardProps): JSX.Element {
  const style = TYPE_STYLES[suggestion.type] ?? TYPE_STYLES['TALKING_POINT'];

  return (
    <div
      onClick={() => onSelect(suggestion)}
      className="relative bg-zinc-800 rounded-xl p-4 cursor-pointer border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-750 transition-all"
    >
      {suggestion.clicked && (
        <span className="absolute top-2 right-2 text-emerald-400 text-sm">✓</span>
      )}
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
          {style.icon} {style.label}
        </span>
      </div>
      <p className="text-sm text-zinc-200 leading-relaxed mt-2">{suggestion.preview}</p>
      <p className="mt-2 text-zinc-500" style={{ fontSize: '11px' }}>
        Click for details →
      </p>
    </div>
  );
}
