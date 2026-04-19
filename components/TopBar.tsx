'use client';

import StatusBadge from './StatusBadge';
import { useSessionStore } from '../store/session';
import { downloadSessionExport } from '../lib/export';

interface TopBarProps {
  onOpenSettings: () => void;
}

export default function TopBar({ onOpenSettings }: TopBarProps): JSX.Element {
  const exportSession = useSessionStore((s) => s.exportSession);

  const handleExport = (): void => {
    const session = exportSession();
    downloadSessionExport(session);
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-zinc-900 border-b border-zinc-800 flex-shrink-0">
      <div>
        <span className="text-white font-semibold text-lg">TwinMind</span>
        <span className="ml-2 text-zinc-400 text-xs">Live Suggestions</span>
      </div>
      <StatusBadge />
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          className="px-3 py-1.5 text-sm text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
        >
          Export
        </button>
        <button
          onClick={onOpenSettings}
          className="px-3 py-1.5 text-sm text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-colors"
        >
          Settings
        </button>
      </div>
    </div>
  );
}
