/**
 * Tiny API client — talks to the Express server which proxies to Groq.
 * The Vite dev server proxies /api → http://localhost:8787
 */
async function post(path, body) {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || `${r.status} ${r.statusText}`);
  return data;
}

export const api = {
  chat:      (message, history, context)  => post('/api/chat', { message, history, context }),
  inventory: (inventory)                => post('/api/inventory/analyze', { inventory }),
  sentiment: (reviews)                  => post('/api/sentiment/analyze', { reviews }),
  sales:     (data, focus)              => post('/api/sales/forecast', { data, focus }),
  recommend: (product, category)        => post('/api/recommend/suggest', { product, category }),
  snowflake: (scenario)                 => post('/api/snowflake/demo', { scenario }),
  health:    async () => {
    const r = await fetch('/api/health');
    return r.json();
  },
};
