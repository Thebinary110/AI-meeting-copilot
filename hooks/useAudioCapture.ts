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

const WHISPER_HALLUCINATIONS = new Set([
  'thank you.',
  'thanks for watching.',
  'thanks.',
  'obrigado.',
  'obrigado pela atenção.',
  'gracias.',
  'merci.',
  'merci beaucoup.',
  'danke.',
  'danke schön.',
  'you',
  '.',
  '...',
  '[silence]',
  '[ silence ]',
  '(silence)',
  '[blank_audio]',
  '[ blank_audio ]',
  'subtitles by the amara.org community',
  'www.mooji.org',
]);

function isHallucination(text: string): boolean {
  return WHISPER_HALLUCINATIONS.has(text.trim().toLowerCase());
}

function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
}

export function useAudioCapture(): UseAudioCaptureReturn {
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processingRef = useRef<boolean>(false);
  const chunkQueueRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>('audio/webm');

  const { appendTranscriptChunk, setRecording, setError } = useSessionStore();
  const isRecording = useSessionStore((s) => s.isRecording);
  const groqApiKey = useSettingsStore((s) => s.groqApiKey);

  const processQueue = useCallback(async (): Promise<void> => {
    if (processingRef.current) return;
    processingRef.current = true;

    while (chunkQueueRef.current.length > 0) {
      const blob = chunkQueueRef.current.shift();
      if (!blob || blob.size < 1000) continue;

      const ext = mimeTypeRef.current.includes('mp4') ? 'mp4'
        : mimeTypeRef.current.includes('ogg') ? 'ogg'
        : 'webm';
      const fileType = mimeTypeRef.current || 'audio/webm';

      const makeFormData = (): FormData => {
        const fd = new FormData();
        fd.append('audio', new File([blob], `chunk.${ext}`, { type: fileType }));
        fd.append('apiKey', groqApiKey);
        return fd;
      };

      const attemptTranscribe = async (): Promise<string | null> => {
        try {
          const res = await fetch('/api/transcribe', { method: 'POST', body: makeFormData() });
          const data = await res.json() as { text?: string; error?: string };
          if (data.error) {
            setError(data.error);
            return null;
          }
          return data.text ?? null;
        } catch {
          return null;
        }
      };

      let text = await attemptTranscribe();
      if (text === null) {
        await new Promise((r) => setTimeout(r, 1000));
        text = await attemptTranscribe();
      }

      if (text && text.trim().length > 0 && !isHallucination(text)) {
        appendTranscriptChunk({
          id: uuid(),
          timestamp: new Date().toISOString(),
          text: text.trim(),
          wordCount: text.trim().split(/\s+/).length,
        });
      }
    }

    processingRef.current = false;
  }, [appendTranscriptChunk, groqApiKey, setError]);

  const startRecording = useCallback(async (): Promise<void> => {
    setPermissionError(null);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType || 'audio/webm';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
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

      recorder.start(10000);
      setRecording(true);
    } catch (err) {
      const message =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Microphone access denied. Please allow mic access and reload.'
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
