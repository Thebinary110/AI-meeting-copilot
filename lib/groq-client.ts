import Groq from 'groq-sdk';

let _client: Groq | null = null;

export function getGroqClient(): Groq {
  if (!_client) {
    const key = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!key) throw new Error('NEXT_PUBLIC_GROQ_API_KEY is not set');
    _client = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });
  }
  return _client;
}
