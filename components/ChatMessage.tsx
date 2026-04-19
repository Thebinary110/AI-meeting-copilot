'use client';

import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatMessage({ message }: ChatMessageProps): JSX.Element {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}>
      <div
        className={`px-4 py-3 max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm ml-auto'
            : `bg-zinc-800 text-zinc-100 rounded-2xl rounded-tl-sm ${message.isStreaming ? 'streaming-cursor' : ''}`
        }`}
      >
        {message.content || (message.isStreaming ? '' : '...')}
      </div>
      <span className="text-xs text-zinc-500 px-1">{formatTimestamp(message.timestamp)}</span>
    </div>
  );
}
