'use client';

import { useSessionStore } from '../store/session';

export default function StatusBadge(): JSX.Element {
  const isRecording = useSessionStore((s) => s.isRecording);
  const errorMessage = useSessionStore((s) => s.errorMessage);

  if (errorMessage) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#c0392b]" />
        <span className="text-xs text-[#888]">Error</span>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#e05252] pulse-dot" />
        <span className="text-xs text-[#888]">Recording</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-[#333]" />
      <span className="text-xs text-[#555]">Idle</span>
    </div>
  );
}
