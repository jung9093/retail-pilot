import { useState } from 'react';
import { api } from '../api.js';
import { SAMPLE_SALES } from '../../../server/data/sample.js';
import FileUpload from './FileUpload.jsx';

const trendColor = {
  up:   'text-emerald-600',
  down: 'text-rose-600',
  flat: 'text-slate-600',
};

export default function Sales({ onDataChange }) {
  const [data, setData] = useState('');
  const [focus, setFocus] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function updateData(next) {
    setData(next);
    onDataChange?.(next);
  }

  async function run(overrideData) {
    const value = overrideData ?? data;
    if (!value.trim()) return;
    setBusy(true); setError(''); setResult(null);
    try { setResult(await api.sales(value, focus)); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900">Sales Data</h2>
          <button className="btn-ghost text-xs" onClick={() => { updateData(SAMPLE_SALES); setFocus('denim category'); }}>
            Try sample
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          Paste weekly or daily rows, or upload a CSV/PDF sales report. Optionally call out a focus area.
        </p>

        <FileUpload
          onExtracted={(extracted) => updateData(extracted)}
          hint="CSV export or a PDF sales report"
        />

        <textarea
          className="input h-56 font-mono text-xs mt-3"
          placeholder="Week,Revenue,Units,Returns"
          value={data}
          onChange={(e) => updateData(e.target.value)}
        />
        <input
          className="input mt-3"
          placeholder="Focus (optional) e.g. 'denim category'"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
        />
        <div className="mt-3 flex gap-2">
          <button className="btn-primary" disabled={busy || !data.trim()} onClick={() => run()}>
            {busy ? 'Analyzing…' : 'Forecast & Advise'}
          </button>
          <button className="btn-ghost" onClick={() => { updateData(''); setFocus(''); setResult(null); setError(''); }}>
            Clear
          </button>
        </div>
        {error && <div className="mt-3 text-sm text-rose-600">⚠️ {error}</div>}
      </section>

      <section className="space-y-4">
        {!result && !busy && (
          <div className="card text-center text-slate-500 text-sm">
            Drop in your sales numbers for a 30-day forecast, pricing tweaks, and campaign ideas.
          </div>
        )}

        {result && (
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="label">Trend</div>
                <div className={`text-2xl font-extrabold capitalize ${trendColor[result.trend] || trendColor.flat}`}>
                  {result.trend} {typeof result.trendPct === 'number' && `· ${result.trendPct}%`}
                </div>
              </div>
              {typeof result.forecastNext30d === 'number' && (
                <div className="text-right">
                  <div className="label">Forecast · next 30d</div>
                  <div className="text-2xl font-extrabold text-brand-700">
                    ${Number(result.forecastNext30d).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            {result.drivers?.length > 0 && (
              <div className="mt-3">
                <div className="label">Drivers</div>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                  {result.drivers.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {result?.pricingAdvice?.length > 0 && (
          <div className="card">
            <div className="label">Pricing Advice</div>
            <ul className="space-y-2">
              {result.pricingAdvice.map((p, i) => (
                <li key={i} className="rounded-xl bg-white ring-1 ring-brand-100 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-800">{p.product}</div>
                    <div className="text-brand-700 font-bold">
                      ${p.currentPrice} → ${p.suggestedPrice}
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{p.rationale}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result?.campaignIdeas?.length > 0 && (
          <div className="card">
            <div className="label">Campaign Ideas</div>
            <ul className="space-y-2">
              {result.campaignIdeas.map((c, i) => (
                <li key={i} className="rounded-xl bg-white ring-1 ring-brand-100 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-800">{c.name}</div>
                    <span className="chip">{c.channel}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{c.mechanic}</div>
                  {c.expectedLift && <div className="text-[11px] text-brand-700 mt-1">Expected lift: {c.expectedLift}</div>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result?.watchouts?.length > 0 && (
          <div className="card">
            <div className="label">Watchouts</div>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              {result.watchouts.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
