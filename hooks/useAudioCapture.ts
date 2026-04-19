'use client';

import { useRef, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { useSessionStore } from '../store/session';
import { useSettingsStore } from '../store/settings';

interface UseAudioCaptureReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  permissionError: string | null;
}

export function useAudioCapture(): UseAudioCaptureReturn {
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processingRef = useRef<boolean>(false);
  const chunkQueueRef = useRef<Blob[]>([]);

  const { appendTranscriptChunk, setRecording, setError } = useSessionStore();
  const isRecording = useSessionStore((s) => s.isRecording);
  const groqApiKey = useSettingsStore((s) => s.groqApiKey);

  const processQueue = useCallback(async (): Promise<void> => {
    if (processingRef.current) return;
    processingRef.current = true;

    while (chunkQueueRef.current.length > 0) {
      const blob = chunkQueueRef.current.shift();
      if (!blob) continue;

      const file = new File([blob], 'chunk.webm', { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('apiKey', groqApiKey);

      const attemptTranscribe = async (): Promise<string | null> => {
        try {
          const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
          const data = await res.json() as { text?: string; error?: string };
          if (data.error) return null;
          return data.text ?? null;
        } catch {
          return null;
        }
      };

      let text = await attemptTranscribe();
      if (text === null) {
        text = await attemptTranscribe();
      }

      if (text && text.trim().split(/\s+/).length > 5) {
        appendTranscriptChunk({
          id: uuid(),
          timestamp: new Date().toISOString(),
          text: text.trim(),
          wordCount: text.trim().split(/\s+/).length,
        });
      }
    }

    processingRef.current = false;
  }, [appendTranscriptChunk, groqApiKey]);

  const startRecording = useCallback(async (): Promise<void> => {
    setPermissionError(null);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunkQueueRef.current.push(event.data);
          void processQueue();
        }
      };

      recorder.onerror = () => {
        setError('Recording error occurred');
      };

      recorder.start(30000);
      setRecording(true);
    } catch (err) {
      const message =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow mic access and reload.'
          : 'Failed to start recording';
      setPermissionError(message);
      setError(message);
    }
  }, [processQueue, setRecording, setError]);

  const stopRecording = useCallback((): void => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setRecording(false);
  }, [setRecording]);

  return { isRecording, startRecording, stopRecording, permissionError };
}
