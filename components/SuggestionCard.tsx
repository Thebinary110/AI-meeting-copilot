'use client';

import type { Suggestion, SuggestionType } from '../types';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onSelect: (suggestion: Suggestion) => void;
}

const TYPE_LABEL: Record<SuggestionType, string> = {
  QUESTION_TO_ASK: 'Question',
  FACT_CHECK: 'Fact Check',
  TALKING_POINT: 'Talking Point',
  CLARIFICATION: 'Clarification',
  ANSWER_PROVIDED: 'Answer',
  FOLLOWUP: 'Follow-up',
};

export default function SuggestionCard({ suggestion, onSelect }: SuggestionCardProps): JSX.Element {
  const label = TYPE_LABEL[suggestion.type] ?? suggestion.type;

  return (
    <div
      onClick={() => onSelect(suggestion)}
      className="group relative px-4 py-3.5 rounded-lg bg-[#141414] border border-[#202020] hover:border-[#2e2e2e] hover:bg-[#171717] cursor-pointer transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-[#555] font-medium">
          {label}
        </span>
        {suggestion.clicked && (
          <span className="text-[10px] text-[#555]">✓</span>
        )}
      </div>
      <p className="text-sm text-[#c8c8c8] leading-relaxed">{suggestion.preview}</p>
      <p className="mt-2.5 text-[10px] text-[#3a3a3a] group-hover:text-[#555] transition-colors">
        Open in chat →
      </p>
    </div>
  );
}
