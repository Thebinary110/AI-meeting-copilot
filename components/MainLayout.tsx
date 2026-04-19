'use client';

import { useState, useEffect } from 'react';
import TopBar from './TopBar';
import TranscriptPanel from './TranscriptPanel';
import SuggestionsPanel from './SuggestionsPanel';
import ChatPanel from './ChatPanel';
import SettingsModal from './SettingsModal';
import { useSettingsStore } from '../store/settings';

export default function MainLayout(): JSX.Element {
  const [showSettings, setShowSettings] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const groqApiKey = useSettingsStore((s) => s.groqApiKey);

  useEffect(() => {
    useSettingsStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  const missingKey = hydrated && !groqApiKey.trim();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {missingKey && (
        <div className="flex items-center justify-between gap-3 px-6 py-2.5 bg-amber-900/40 border-b border-amber-700/50 flex-shrink-0">
          <p className="text-sm text-amber-300">
            <span className="font-medium">Groq API key required.</span>{' '}
            Open Settings and paste your key to get started.
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-1 text-xs font-medium bg-amber-700/50 hover:bg-amber-700 text-amber-200 rounded-lg border border-amber-600/50 transition-colors flex-shrink-0"
          >
            Open Settings
          </button>
        </div>
      )}
      <TopBar onOpenSettings={() => setShowSettings(true)} />
      <div
        className="flex-1 overflow-hidden grid"
        style={{ gridTemplateColumns: '260px 1fr 320px' }}
      >
        <div className="border-r border-zinc-800 overflow-y-auto">
          <TranscriptPanel />
        </div>
        <div className="border-r border-zinc-800 overflow-y-auto">
          <SuggestionsPanel />
        </div>
        <div className="overflow-y-auto">
          <ChatPanel />
        </div>
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
