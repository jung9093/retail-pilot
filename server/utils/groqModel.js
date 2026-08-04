import fetch from 'node-fetch';

// Groq — OpenAI-compatible chat completions endpoint.
// Docs: https://console.groq.com/docs/quickstart
const ENDPOINT = process.env.GROQ_ENDPOINT || 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

/**
 * Generic call to Groq chat completions (OpenAI-compatible schema).
 * @param {Array<{role:string, content:string}>} messages
 * @param {object} opts  { temperature, json, maxTokens }
 * @returns {string} assistant text
 */
export async function callGroqModel(messages, opts = {}) {
  const key = process.env.GROQ_API_KEY;
  if (!key || key.includes('PASTE_')) {
    throw new Error('GROQ_API_KEY missing — paste your key into .env and restart the server.');
  }

  const body = {
    model: MODEL,
    messages,
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 900,
    top_p: 0.95,
  };

  if (opts.json) {
    body.response_format = { type: 'json_object' };
  }

  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Groq API ${r.status}: ${err.slice(0, 400)}`);
  }

  const data = await r.json();
  const content = data?.choices?.[0]?.message?.content ?? '';
  return content;
}
