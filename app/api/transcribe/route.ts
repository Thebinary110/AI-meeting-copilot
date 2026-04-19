import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get('audio');
    const apiKey = (formData.get('apiKey') as string | null)?.trim()
      ?? process.env.NEXT_PUBLIC_GROQ_API_KEY
      ?? '';

    if (!audioBlob || !(audioBlob instanceof Blob)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'No Groq API key provided. Please add your key in Settings.' },
        { status: 401 }
      );
    }

    const groq = new Groq({ apiKey });

    const file = new File([audioBlob], 'chunk.webm', { type: 'audio/webm' });

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3',
      response_format: 'json',
    });

    return NextResponse.json({ text: transcription.text ?? '' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Transcription failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
