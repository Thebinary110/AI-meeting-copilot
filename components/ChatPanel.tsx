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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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
    const maxH = parseInt(getComputedStyle(el).lineHeight) * 4;
    el.style.height = `${Math.min(el.scrollHeight, maxH)}px`;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex-shrink-0">
        <span className="text-sm font-medium text-zinc-300">Chat</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-500 text-sm text-center">
              Click a suggestion or type a question
            </p>
          </div>
        ) : (
          chatHistory.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 bg-zinc-900 border-t border-zinc-800 p-4">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask a question..."
            rows={1}
            className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-sm resize-none outline-none border border-zinc-700 focus:border-zinc-500 text-zinc-100 placeholder-zinc-500"
            style={{ maxHeight: '96px' }}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoadingChat || !input.trim()}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors flex-shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
