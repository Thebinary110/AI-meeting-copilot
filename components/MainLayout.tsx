'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import TopBar from './TopBar';
import TranscriptPanel from './TranscriptPanel';
import SuggestionsPanel from './SuggestionsPanel';
import ChatPanel from './ChatPanel';
import SettingsModal from './SettingsModal';
import { useSettingsStore } from '../store/settings';

const MIN_W = 180;

export default function MainLayout(): JSX.Element {
  const [showSettings, setShowSettings] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const groqApiKey = useSettingsStore((s) => s.groqApiKey);

  const [leftW, setLeftW] = useState(260);
  const [rightW, setRightW] = useState(300);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ handle: 'left' | 'right'; startX: number; startW: number } | null>(null);

  useEffect(() => {
    useSettingsStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  const onDragStart = useCallback(
    (handle: 'left' | 'right') => (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = {
        handle,
        startX: e.clientX,
        startW: handle === 'left' ? leftW : rightW,
      };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [leftW, rightW],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current || !containerRef.current) return;
      const { handle, startX, startW } = dragRef.current;
      const delta = e.clientX - startX;
      const total = containerRef.current.offsetWidth;
      if (handle === 'left') {
        setLeftW(Math.max(MIN_W, Math.min(startW + delta, total - rightW - MIN_W * 2)));
      } else {
        setRightW(Math.max(MIN_W, Math.min(startW - delta, total - leftW - MIN_W * 2)));
      }
    };
    const onUp = () => {
      dragRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [leftW, rightW]);

  const missingKey = hydrated && !groqApiKey.trim();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0c0c0c] text-[#e0e0e0]">
      {missingKey && (
        <div className="flex items-center justify-between gap-3 px-5 py-2 bg-[#141008] border-b border-[#2a2010] flex-shrink-0">
          <p className="text-xs text-[#a08840]">
            Groq API key required — open Settings to add it.
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="px-2.5 py-1 text-xs text-[#a08840] border border-[#2a2010] hover:border-[#3a3010] rounded transition-colors flex-shrink-0"
          >
            Settings
          </button>
        </div>
      )}
      <TopBar onOpenSettings={() => setShowSettings(true)} />
      <div ref={containerRef} className="flex-1 overflow-hidden flex min-h-0">
        <div
          style={{ width: leftW, minWidth: MIN_W }}
          className="flex-shrink-0 overflow-hidden border-r border-[#1c1c1c]"
        >
          <TranscriptPanel />
        </div>
        <div
          onMouseDown={onDragStart('left')}
          className="w-[3px] flex-shrink-0 cursor-col-resize hover:bg-[#3b82f6]/40 bg-transparent transition-colors"
        />
        <div className="flex-1 overflow-hidden border-r border-[#1c1c1c] min-w-0">
          <SuggestionsPanel />
        </div>
        <div
          onMouseDown={onDragStart('right')}
          className="w-[3px] flex-shrink-0 cursor-col-resize hover:bg-[#3b82f6]/40 bg-transparent transition-colors"
        />
        <div
          style={{ width: rightW, minWidth: MIN_W }}
          className="flex-shrink-0 overflow-hidden"
        >
          <ChatPanel />
        </div>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
