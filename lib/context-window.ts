import type { TranscriptChunk } from '../types';

export function getTranscriptWindow(
  chunks: TranscriptChunk[],
  maxWords: number
): string {
  if (chunks.length === 0) return '';

  const fullText = chunks.map((c) => c.text).join(' ');
  const words = fullText.split(/\s+/);

  if (words.length <= maxWords) return fullText;

  const windowWords = words.slice(-maxWords).join(' ');

  const sentenceBreak = windowWords.indexOf('. ');
  if (sentenceBreak !== -1 && sentenceBreak < windowWords.length * 0.3) {
    return windowWords.slice(sentenceBreak + 2);
  }

  return windowWords;
}

export function getFullTranscript(chunks: TranscriptChunk[]): string {
  return chunks.map((c) => `[${c.timestamp}] ${c.text}`).join('\n');
}
