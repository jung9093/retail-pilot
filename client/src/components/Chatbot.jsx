import { useState, useRef, useEffect } from 'react';
import { api } from '../api.js';

const SUGGESTIONS = [
  'How do I reduce stockouts for fast-moving items?',
  'My weekend foot traffic is dropping — what should I try?',
  'Best way to handle a supplier who keeps missing lead times?',
  'I have 2 hours of dead time on a Tuesday — what do I do?',
];

export default function Chatbot({ context }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hey, I'm RetailPilot 👋  Ask me anything about running your store — stock, pricing, staffing, customers, promotions. I'll give you actions, not platitudes.",
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);

  const hasContext = !!(context?.inventory?.trim() || context?.reviews?.trim() || context?.sales?.trim());

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  async function send(text) {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    const next = [...messages, { role: 'user', content: message }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const { reply } = await api.chat(message, next, context);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${e.message}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-rows-[1fr_auto] gap-4 h-full max-h-[calc(100vh-160px)]">
      <div
        ref={scrollRef}
        className="overflow-y-auto rounded-2xl bg-white/70 ring-1 ring-brand-100 p-5 space-y-4"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap text-sm leading-relaxed rounded-2xl px-4 py-3 shadow-sm
              ${m.role === 'user'
                ? 'bg-brand-600 text-white rounded-br-sm'
                : 'bg-white text-slate-800 ring-1 ring-brand-100 rounded-bl-sm'}`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-white ring-1 ring-brand-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-slate-500">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce" style={{ animationDelay: '120ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '240ms' }}>●</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {hasContext && (
          <div className="text-[11px] text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100 rounded-full px-3 py-1 inline-flex items-center gap-1.5 w-fit">
            ✓ Using your uploaded {[
              context?.inventory?.trim() && 'inventory',
              context?.reviews?.trim() && 'reviews',
              context?.sales?.trim() && 'sales',
            ].filter(Boolean).join(', ')} data
          </div>
        )}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs text-brand-800 bg-brand-50 hover:bg-brand-100 ring-1 ring-brand-100 rounded-full px-3 py-1.5 transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex gap-2"
        >
          <input
            className="input flex-1"
            placeholder="Ask RetailPilot…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
          />
          <button type="submit" className="btn-primary" disabled={busy || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
