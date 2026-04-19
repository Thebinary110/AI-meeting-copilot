'use client';

import { useEffect, useRef } from 'react';
import { useSessionStore } from '../store/session';
import { useAudioCapture } from '../hooks/useAudioCapture';

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toTimeString().slice(0, 8);
}

export default function TranscriptPanel(): JSX.Element {
  const transcript = useSessionStore((s) => s.transcript);
  const { isRecording, startRecording, stopRecording, permissionError } = useAudioCapture();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript.length]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 flex-shrink-0">
        <span className="text-sm font-medium text-zinc-300">Transcript</span>
        <button
          onClick={isRecording ? stopRecording : () => void startRecording()}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isRecording
              ? 'bg-red-900/50 text-red-300 border border-red-700/50 hover:bg-red-900'
              : 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900'
          }`}
        >
          {isRecording ? (
            <>
              <span className="w-2.5 h-2.5 rounded-sm bg-red-400" />
              Stop
            </>
          ) : (
            <>
              <MicIcon />
              Start Recording
            </>
          )}
        </button>
      </div>

      {permissionError && (
        <div className="mx-4 mt-3 p-3 bg-orange-900/30 border border-orange-700/50 rounded-lg text-xs text-orange-300">
          {permissionError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {transcript.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-zinc-500 text-sm text-center">
              Press Start Recording to begin
            </p>
          </div>
        ) : (
          transcript.map((chunk, i) => {
            const isLatest = i === transcript.length - 1;
            return (
              <div
                key={chunk.id}
                className={`${isLatest ? 'bg-zinc-800 rounded-lg p-3' : ''}`}
              >
                <p className="text-xs text-zinc-500 mb-1">
                  {formatTimestamp(chunk.timestamp)}
                </p>
                <p className="text-sm text-white leading-relaxed">{chunk.text}</p>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function MicIcon(): JSX.Element {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm-1 15.93V20H9v2h6v-2h-2v-2.07A8.001 8.001 0 0 0 20 11h-2a6 6 0 0 1-12 0H4a8.001 8.001 0 0 0 7 7.93z" />
    </svg>
  );
}
