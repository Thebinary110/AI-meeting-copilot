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

  useEffect(() => {
    useSettingsStore.persist.rehydrate();
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-zinc-100">
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
