# TwinMind Live Suggestions

An always-on AI meeting copilot that transcribes audio in real-time, surfaces live contextual suggestions, and lets you chat with an AI assistant grounded in your conversation.

## Setup

```bash
git clone <repo-url>
cd twinmind
npm install
cp .env.local.example .env.local
# Edit .env.local and paste your Groq API key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click **Start Recording** to begin.

Get a free Groq API key at [console.groq.com](https://console.groq.com).

## Stack choices

**Next.js 14 (App Router)** — Server Components let API routes run server-side (keeping the Groq SDK out of the browser bundle), while Client Components handle real-time UI updates. The App Router's streaming response support makes SSE straightforward.

**Zustand** — Minimal, hook-first state management with zero boilerplate. The `persist` middleware handles localStorage without extra configuration. Chosen over Redux (too heavy) and React Context (re-render performance at this scale).

**Groq** — Fastest inference available for Whisper and Llama 4. Sub-second transcription latency is essential for a real-time copilot. The `groq-sdk` package provides first-class streaming support.

## Prompt strategy

**Suggestion type system** — Six types (QUESTION_TO_ASK, FACT_CHECK, TALKING_POINT, CLARIFICATION, ANSWER_PROVIDED, FOLLOWUP) map to distinct conversational moments. The model selects the 3 most contextually appropriate types rather than always using a fixed formula — this produces more relevant suggestions.

**Self-contained preview** — The `preview` field must be immediately useful without clicking. It answers "what should I do right now?" in 1-2 sentences. This prevents the panel from feeling like a teaser wall.

**Context window sizing** — Suggestions use 600 words (recent context only) because recency is most relevant for live suggestions. Chat uses 6000 words (full transcript) because questions may reference earlier moments.

**detailPrompt generation** — The model generates the `detailPrompt` itself as part of the suggestion JSON. This means the chat query is phrased optimally for the LLM to answer, not just a rephrasing of the preview.

## Tradeoffs

**Client-side API key** — `NEXT_PUBLIC_GROQ_API_KEY` is accessible in the browser. Acceptable for a demo/local tool; in production, proxy all Groq calls through server-side API routes and remove the `NEXT_PUBLIC_` prefix.

**30s refresh vs real-time** — Continuous suggestion generation would cost significantly more and create UI noise. 30s provides a useful cadence without overwhelming the user; configurable in Settings.

**No speaker diarization** — Whisper Large V3 transcribes without speaker labels. Adding diarization would require a separate pipeline (e.g., pyannote.audio) and significantly increase latency.

## File structure

```
/app              Next.js App Router pages and API routes
/app/api          Three API routes: transcribe, suggestions, chat
/components       All UI components (no external UI library)
/hooks            Custom hooks for audio capture, suggestion loop, chat streaming
/lib              Utilities: Groq client, context windowing, audio chunking, export
/store            Zustand stores (session = ephemeral, settings = persisted)
/types            Shared TypeScript interfaces and types
```
