'use client';

import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useSessionStore } from '../store/session';
import { useChatStream } from '../hooks/useChatStream';
import ChatMessage from './ChatMessage';

export default function ChatPanel(): JSX.Element {
  const chatHistory = useSessionStore((s) => s.chatHistory);
  const isLoadingChat = useSessionStore((s) => s.isLoadingChat);
  const { sendMessage } = useChatStream();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory.length]);

  const handleSubmit = (): void => {
    const trimmed = input.trim();
    if (!trimmed || isLoadingChat) return;
    setInput('');
    void sendMessage(trimmed, 'user_typed');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (): void => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 h-10 flex items-center border-b border-[#1c1c1c] flex-shrink-0">
        <span className="text-xs font-medium text-[#888] uppercase tracking-wider">Chat</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {chatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#444] text-xs text-center leading-relaxed">
              Click a suggestion or<br />ask a question below
            </p>
          </div>
        ) : (
          chatHistory.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 border-t border-[#1c1c1c] p-3">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask a question…"
            rows={1}
            className="flex-1 bg-[#141414] border border-[#222] focus:border-[#333] rounded-lg px-3 py-2 text-sm text-[#e0e0e0] placeholder-[#3a3a3a] resize-none outline-none transition-colors"
            style={{ maxHeight: '96px' }}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoadingChat || !input.trim()}
            className="h-9 px-3 bg-[#1a2234] hover:bg-[#1e2a40] disabled:opacity-30 disabled:cursor-not-allowed text-[#6090c8] rounded-lg text-sm transition-colors flex-shrink-0 border border-[#1e2e48]"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function SendIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
