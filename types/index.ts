export type SuggestionType =
  | 'QUESTION_TO_ASK'
  | 'FACT_CHECK'
  | 'TALKING_POINT'
  | 'CLARIFICATION'
  | 'ANSWER_PROVIDED'
  | 'FOLLOWUP';

export interface TranscriptChunk {
  id: string;
  timestamp: string;
  text: string;
  wordCount: number;
}

export interface Suggestion {
  id: string;
  type: SuggestionType;
  preview: string;
  detailPrompt: string;
  clicked: boolean;
}

export interface SuggestionBatch {
  id: string;
  timestamp: string;
  trigger: 'auto' | 'manual';
  suggestions: Suggestion[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source: 'suggestion_click' | 'user_typed';
  isStreaming?: boolean;
}

export interface SessionExport {
  exported_at: string;
  session_duration_seconds: number;
  transcript: TranscriptChunk[];
  suggestion_batches: SuggestionBatch[];
  chat_history: ChatMessage[];
}

export interface Settings {
  groqApiKey: string;
  suggestionPrompt: string;
  chatPrompt: string;
  suggestionContextWords: number;
  chatContextWords: number;
  refreshIntervalMs: number;
  enabledSuggestionTypes: SuggestionType[];
}
