'use client';

import StatusBadge from './StatusBadge';
import { useSessionStore } from '../store/session';
import { downloadSessionExport } from '../lib/export';

interface TopBarProps {
  onOpenSettings: () => void;
}

export default function TopBar({ onOpenSettings }: TopBarProps): JSX.Element {
  const exportSession = useSessionStore((s) => s.exportSession);

  return (
    <div className="flex items-center justify-between px-5 h-11 bg-[#0c0c0c] border-b border-[#1c1c1c] flex-shrink-0">
      <div className="flex items-center gap-3">
        <span className="text-[#e0e0e0] font-medium text-sm tracking-tight">TwinMind</span>
        <span className="w-px h-3 bg-[#2a2a2a]" />
        <StatusBadge />
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => downloadSessionExport(exportSession())}
          className="h-7 px-3 text-xs text-[#888] hover:text-[#ccc] border border-[#222] hover:border-[#333] rounded transition-colors"
        >
          Export
        </button>
        <button
          onClick={onOpenSettings}
          className="h-7 px-3 text-xs text-[#888] hover:text-[#ccc] border border-[#222] hover:border-[#333] rounded transition-colors"
        >
          Settings
        </button>
      </div>
    </div>
  );
}
