'use client';

import { useEffect, useRef } from 'react';
import { useSessionStore } from '../store/session';
import { useAudioCapture } from '../hooks/useAudioCapture';

function formatTime(iso: string): string {
  return new Date(iso).toTimeString().slice(0, 8);
}

export default function TranscriptPanel(): JSX.Element {
  const transcript = useSessionStore((s) => s.transcript);
  const { isRecording, startRecording, stopRecording, permissionError } = useAudioCapture();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 h-10 border-b border-[#1c1c1c] flex-shrink-0">
        <span className="text-xs font-medium text-[#888] uppercase tracking-wider">Transcript</span>
        <button
          onClick={isRecording ? stopRecording : () => void startRecording()}
          className={`flex items-center gap-1.5 h-6 px-2.5 rounded text-xs font-medium transition-colors ${
            isRecording
              ? 'text-[#e05252] border border-[#2a1a1a] hover:bg-[#1a0a0a]'
              : 'text-[#888] border border-[#222] hover:text-[#ccc] hover:border-[#333]'
          }`}
        >
          {isRecording ? (
            <>
              <span className="w-1.5 h-1.5 rounded-sm bg-[#e05252]" />
              Stop
            </>
          ) : (
            <>
              <MicIcon />
              Record
            </>
          )}
        </button>
      </div>

      {permissionError && (
        <div className="mx-3 mt-3 px-3 py-2 border border-[#2a1a1a] rounded text-xs text-[#a06060]">
          {permissionError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
        {transcript.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#444] text-xs text-center leading-relaxed">
              Press Record to begin<br />capturing audio
            </p>
          </div>
        ) : (
          transcript.map((chunk) => (
            <div key={chunk.id}>
              <p className="text-[10px] text-[#444] mb-1 tabular-nums">{formatTime(chunk.timestamp)}</p>
              <p className="text-sm text-[#c8c8c8] leading-relaxed">{chunk.text}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[#1c1c1c] flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e05252] pulse-dot" />
          <span className="text-xs text-[#555]">Listening…</span>
        </div>
      )}
    </div>
  );
}

function MicIcon(): JSX.Element {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm-1 15.93V20H9v2h6v-2h-2v-2.07A8.001 8.001 0 0 0 20 11h-2a6 6 0 0 1-12 0H4a8.001 8.001 0 0 0 7 7.93z" />
    </svg>
  );
}
