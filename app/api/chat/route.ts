import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';

interface ChatRequestMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  apiKey: string;
  messages: ChatRequestMessage[];
  fullTranscript: string;
  prompt: string;
}

function errorStream(message: string): Response {
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`));
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
  return new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body: RequestBody = await req.json() as RequestBody;
    const { messages, fullTranscript, prompt } = body;

    const apiKey = body.apiKey?.trim()
      || process.env.NEXT_PUBLIC_GROQ_API_KEY
      || '';

    if (!apiKey) {
      return errorStream('No Groq API key provided. Please add your key in Settings.');
    }

    const groq = new Groq({ apiKey });

    const systemPrompt = prompt.replace('{TRANSCRIPT}', fullTranscript);

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.5,
      max_tokens: 2048,
      stream: true,
    });

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content;
            if (token) {
              controller.enqueue(encoder.encode(`data: ${token}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chat failed';
    return errorStream(`Error: ${message}`);
  }
}
