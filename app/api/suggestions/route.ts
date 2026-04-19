import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

interface SuggestionRaw {
  type: string;
  preview: string;
  detailPrompt: string;
}

interface RequestBody {
  transcriptWindow: string;
  previousSuggestions: string[];
  prompt: string;
}

function parseJsonSuggestions(raw: string): SuggestionRaw[] {
  const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed: unknown = JSON.parse(clean);
  if (!Array.isArray(parsed)) throw new Error('Expected JSON array');
  return parsed as SuggestionRaw[];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: RequestBody = await req.json() as RequestBody;
    const { transcriptWindow, previousSuggestions, prompt } = body;

    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_GROQ_API_KEY is not set' }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    const filledPrompt = prompt
      .replace('{TRANSCRIPT}', transcriptWindow)
      .replace('{PREVIOUS_SUGGESTIONS}', previousSuggestions.join('; '));

    const callGroq = async (systemPrompt: string): Promise<string> => {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: systemPrompt }],
        temperature: 0.7,
        max_tokens: 1024,
      });
      return completion.choices[0]?.message?.content ?? '';
    };

    let raw = await callGroq(filledPrompt);
    let suggestions: SuggestionRaw[];

    try {
      suggestions = parseJsonSuggestions(raw);
    } catch {
      raw = await callGroq(
        filledPrompt + '\n\nIMPORTANT: Respond with ONLY a valid JSON array. No text before or after.'
      );
      try {
        suggestions = parseJsonSuggestions(raw);
      } catch {
        return NextResponse.json({
          suggestions: [
            {
              id: crypto.randomUUID(),
              type: 'TALKING_POINT',
              preview: 'Could not parse suggestions. Please try refreshing.',
              detailPrompt: 'What are the key talking points from this conversation?',
              clicked: false,
            },
          ],
        });
      }
    }

    const withIds = suggestions.slice(0, 3).map((s) => ({
      ...s,
      id: crypto.randomUUID(),
      clicked: false,
    }));

    return NextResponse.json({ suggestions: withIds });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Suggestions failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
