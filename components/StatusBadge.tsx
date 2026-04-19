'use client';

import { useSessionStore } from '../store/session';

export default function StatusBadge(): JSX.Element {
  const isRecording = useSessionStore((s) => s.isRecording);
  const errorMessage = useSessionStore((s) => s.errorMessage);

  if (errorMessage) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-400" />
        <span className="text-sm text-orange-400">Error</span>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 pulse-red" />
        <span className="text-sm text-red-400">Recording</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-zinc-500" />
      <span className="text-sm text-zinc-400">Idle</span>
    </div>
  );
}
