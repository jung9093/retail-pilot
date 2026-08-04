import { useState } from 'react';
import { api } from '../api.js';
import { SAMPLE_INVENTORY } from '../../../server/data/sample.js';
import FileUpload from './FileUpload.jsx';

const sevColor = {
  high:   'bg-rose-100 text-rose-700 ring-rose-200',
  medium: 'bg-amber-100 text-amber-700 ring-amber-200',
  low:    'bg-emerald-100 text-emerald-700 ring-emerald-200',
};

const INVENTORY_DEMOS = [
  { label: 'Demo: CSV export', icon: '📄', path: '/demo/demo-inventory.csv', name: 'demo-inventory.csv', type: 'text/csv' },
  { label: 'Demo: stockroom photo (OCR)', icon: '📷', path: '/demo/demo-inventory-photo.png', name: 'demo-inventory-photo.png', type: 'image/png' },
];

export default function Inventory({ onDataChange }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function updateText(next) {
    setText(next);
    onDataChange?.(next);
  }

  async function analyze(inv) {
    setBusy(true); setError(''); setResult(null);
    try { setResult(await api.inventory(inv)); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900">Inventory Snapshot</h2>
          <button className="btn-ghost text-xs" onClick={() => updateText(SAMPLE_INVENTORY)}>
            Try sample
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          Paste CSV rows (sku, name, on_hand, weekly_velocity, lead_time_days, unit_cost, supplier)
          — or upload a CSV export, a PDF stock report, or a photo of your stockroom sheet.
        </p>

        <FileUpload
          onExtracted={(extracted) => { updateText(extracted); analyze(extracted); }}
          demos={INVENTORY_DEMOS}
          hint="CSV export, PDF report, or a photo of a handwritten/printed sheet"
        />

        <textarea
          className="input h-56 font-mono text-xs mt-3"
          placeholder="sku,name,on_hand,weekly_velocity,lead_time_days,unit_cost,supplier"
          value={text}
          onChange={(e) => updateText(e.target.value)}
        />
        <div className="mt-3 flex gap-2">
          <button className="btn-primary" disabled={busy || !text.trim()} onClick={() => analyze(text)}>
            {busy ? 'Analyzing…' : 'Analyze Inventory'}
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
            Paste your inventory and run an analysis to see stockout risks, overstock, and a reorder list.
          </div>
        )}

        {result?.summary && (
          <div className="card">
            <div className="label">Summary</div>
            <p className="text-sm text-slate-700">{result.summary}</p>
          </div>
        )}

        {result?.stockoutRisks?.length > 0 && (
          <div className="card">
            <div className="label">Stockout Risks</div>
            <ul className="space-y-2">
              {result.stockoutRisks.map((r, i) => (
                <li key={i} className="flex items-start justify-between gap-3 rounded-xl bg-white ring-1 ring-brand-100 p-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">
                      {r.name} {r.sku && <span className="text-xs text-slate-400">({r.sku})</span>}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">{r.action}</div>
                  </div>
                  <span className={`text-[11px] ring-1 rounded-full px-2 py-0.5 ${sevColor[r.severity] || sevColor.low}`}>
                    {r.daysUntilStockout}d · {r.severity}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result?.overstock?.length > 0 && (
          <div className="card">
            <div className="label">Overstock</div>
            <ul className="space-y-2">
              {result.overstock.map((r, i) => (
                <li key={i} className="rounded-xl bg-white ring-1 ring-brand-100 p-3 text-sm">
                  <div className="font-semibold text-slate-800">
                    {r.name} {r.sku && <span className="text-xs text-slate-400">({r.sku})</span>}
                  </div>
                  <div className="text-xs text-slate-600">{r.weeksOfCover} weeks of cover · {r.action}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result?.reorderList?.length > 0 && (
          <div className="card">
            <div className="label">Reorder List</div>
            <ul className="space-y-2">
              {result.reorderList.map((r, i) => (
                <li key={i} className="flex items-center justify-between rounded-xl bg-white ring-1 ring-brand-100 p-3 text-sm">
                  <div>
                    <div className="font-semibold text-slate-800">{r.name}</div>
                    <div className="text-xs text-slate-600">{r.reason}</div>
                  </div>
                  <div className="text-brand-700 font-bold">+{r.orderQty}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result?.quickWins?.length > 0 && (
          <div className="card">
            <div className="label">Quick Wins</div>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              {result.quickWins.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
