import { useState } from 'react';
import { api } from '../api.js';
import { SAMPLE_REVIEWS } from '../../../server/data/sample.js';
import FileUpload from './FileUpload.jsx';

const sentimentBg = {
  positive: 'bg-emerald-100 text-emerald-700',
  negative: 'bg-rose-100 text-rose-700',
  neutral:  'bg-slate-100 text-slate-700',
};

const REVIEW_DEMOS = [
  { label: 'Demo: reviews PDF', icon: '📄', path: '/demo/demo-reviews.pdf', name: 'demo-reviews.pdf', type: 'application/pdf' },
];

export default function Sentiment({ onDataChange }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function updateText(next) {
    setText(next);
    onDataChange?.(next);
  }

  async function run(overrideText) {
    const value = overrideText ?? text;
    if (!value.trim()) return;
    setBusy(true); setError(''); setResult(null);
    try { setResult(await api.sentiment(value)); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  const overall = result?.overall;
  const score = overall?.score ?? 0;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900">Customer Reviews</h2>
          <button className="btn-ghost text-xs" onClick={() => updateText(SAMPLE_REVIEWS)}>Try sample</button>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          Paste one review per line — or upload a CSV export, a PDF of reviews, or a screenshot.
        </p>

        <FileUpload
          onExtracted={(extracted) => { updateText(extracted); run(extracted); }}
          demos={REVIEW_DEMOS}
          hint="CSV export, PDF of reviews, or a screenshot of feedback"
        />

        <textarea
          className="input h-56 mt-3"
          placeholder="One review per line…"
          value={text}
          onChange={(e) => updateText(e.target.value)}
        />
        <div className="mt-3 flex gap-2">
          <button className="btn-primary" disabled={busy || !text.trim()} onClick={() => run()}>
            {busy ? 'Analyzing…' : 'Analyze Reviews'}
          </button>
          <button className="btn-ghost" onClick={() => { updateText(''); setResult(null); setError(''); }}>
            Clear
          </button>
        </div>
        {error && <div className="mt-3 text-sm text-rose-600">⚠️ {error}</div>}
      </section>

      <section className="space-y-4">
        {!result && !busy && (
          <div className="card text-center text-slate-500 text-sm">
            Paste customer reviews to extract themes, complaints, and a 7-day action list.
          </div>
        )}

        {overall && (
          <div className="card">
            <div className="label">Overall Sentiment</div>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20">
                <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                  <path d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
                        fill="none" stroke="#f3e8ff" strokeWidth="3" />
                  <path d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
                        fill="none" stroke="#7c3aed" strokeWidth="3"
                        strokeDasharray={`${score}, 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-sm font-bold text-brand-700">
                  {score}
                </div>
              </div>
              <div>
                <div className="text-base font-bold capitalize text-slate-800">{overall.label}</div>
                <p className="text-xs text-slate-600 max-w-sm">{overall.summary}</p>
              </div>
            </div>
          </div>
        )}

        {result?.themes?.length > 0 && (
          <div className="card">
            <div className="label">Themes</div>
            <ul className="space-y-2">
              {result.themes.map((t, i) => (
                <li key={i} className="rounded-xl bg-white ring-1 ring-brand-100 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-800">{t.theme}</div>
                    <span className={`text-[11px] rounded-full px-2 py-0.5 ${sentimentBg[t.sentiment] || sentimentBg.neutral}`}>
                      {t.sentiment} · {t.mentions}×
                    </span>
                  </div>
                  {t.example && <div className="text-xs italic text-slate-500 mt-1">"{t.example}"</div>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result?.topComplaints?.length > 0 && (
          <div className="card">
            <div className="label">Top Complaints</div>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              {result.topComplaints.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}

        {result?.topPraises?.length > 0 && (
          <div className="card">
            <div className="label">Top Praises</div>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              {result.topPraises.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
        )}

        {result?.actionsThisWeek?.length > 0 && (
          <div className="card">
            <div className="label">Actions This Week</div>
            <ul className="space-y-2">
              {result.actionsThisWeek.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-0.5 text-brand-600">✓</span> {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
