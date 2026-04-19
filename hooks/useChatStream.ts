'use client';

import { useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { useSessionStore } from '../store/session';
import { useSettingsStore } from '../store/settings';
import { getFullTranscript } from '../lib/context-window';

interface UseChatStreamReturn {
  sendMessage: (content: string, source: 'suggestion_click' | 'user_typed') => Promise<void>;
}

export function useChatStream(): UseChatStreamReturn {
  const {
    transcript,
    chatHistory,
    addChatMessage,
    updateStreamingMessage,
    finalizeStreamingMessage,
    setLoadingChat,
  } = useSessionStore();

  const settings = useSettingsStore();

  const sendMessage = useCallback(
    async (content: string, source: 'suggestion_click' | 'user_typed'): Promise<void> => {
      const userMsg = {
        id: uuid(),
        role: 'user' as const,
        content,
        timestamp: new Date().toISOString(),
        source,
      };
      addChatMessage(userMsg);

      const assistantId = uuid();
      addChatMessage({
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        source: 'user_typed',
        isStreaming: true,
      });

      setLoadingChat(true);

      const fullTranscript = getFullTranscript(transcript);
      const messages = [...chatHistory, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages,
            fullTranscript,
            prompt: settings.chatPrompt,
          }),
        });

        if (!res.ok || !res.body) {
          updateStreamingMessage(assistantId, '— Response failed. Please retry.');
          finalizeStreamingMessage(assistantId);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const payload = trimmed.slice(6);
            if (payload === '[DONE]') {
              finalizeStreamingMessage(assistantId);
              return;
            }
            if (payload) {
              updateStreamingMessage(assistantId, payload);
            }
          }
        }

        finalizeStreamingMessage(assistantId);
      } catch {
        updateStreamingMessage(assistantId, '— Response failed. Please retry.');
        finalizeStreamingMessage(assistantId);
      }
    },
    [
      transcript,
      chatHistory,
      addChatMessage,
      updateStreamingMessage,
      finalizeStreamingMessage,
      setLoadingChat,
      settings.chatPrompt,
    ]
  );

  return { sendMessage };
}
