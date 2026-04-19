export interface AudioChunkerOptions {
  timesliceMs: number;
  onChunk: (blob: Blob) => void;
  onError: (error: Error) => void;
}

export class AudioChunker {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;

  async start(options: AudioChunkerOptions): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'audio/webm;codecs=opus',
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        options.onChunk(event.data);
      }
    };

    this.mediaRecorder.onerror = () => {
      options.onError(new Error('MediaRecorder error'));
    };

    this.mediaRecorder.start(options.timesliceMs);
  }

  stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
  }

  isActive(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}
