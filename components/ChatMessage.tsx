'use client';

import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatMessage({ message }: ChatMessageProps): JSX.Element {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[88%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-[#1a2234] text-[#c8d8f0] rounded-br-sm'
            : `bg-[#161616] text-[#c8c8c8] rounded-bl-sm border border-[#202020] ${message.isStreaming ? 'streaming-cursor' : ''}`
        }`}
      >
        {message.content || (message.isStreaming ? '' : '…')}
      </div>
      <span className="text-[10px] text-[#3a3a3a] px-1">{formatTime(message.timestamp)}</span>
    </div>
  );
}
