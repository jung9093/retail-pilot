import { useState } from 'react';
import { api } from '../api.js';

const EXAMPLES = [
  { product: 'Organic cotton t-shirt', category: 'sustainable apparel boutique' },
  { product: 'Stainless steel water bottle 750ml', category: 'outdoor lifestyle store' },
  { product: 'Hand-poured soy candle (lavender)', category: 'gift shop' },
];

export default function Recommend() {
  const [product, setProduct] = useState('');
  const [category, setCategory] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function run() {
    if (!product.trim()) return;
    setBusy(true); setError(''); setResult(null);
    try { setResult(await api.recommend(product, category)); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <section className="card">
        <h2 className="font-bold text-slate-900">Product Details</h2>
        <p className="text-xs text-slate-500 mb-3">Tell us about the product and your store.</p>

        <label className="label">Product</label>
        <input
          className="input"
          placeholder="e.g. Organic cotton t-shirt"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        />

        <label className="label mt-3">Store / Category (optional)</label>
        <input
          className="input"
          placeholder="e.g. sustainable apparel boutique"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.product}
              onClick={() => { setProduct(ex.product); setCategory(ex.category); }}
              className="text-xs text-brand-800 bg-brand-50 hover:bg-brand-100 ring-1 ring-brand-100 rounded-full px-3 py-1.5 transition"
            >
              {ex.product}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button className="btn-primary" disabled={busy || !product.trim()} onClick={run}>
            {busy ? 'Thinking…' : 'Generate Plan'}
          </button>
          <button className="btn-ghost" onClick={() => { setProduct(''); setCategory(''); setResult(null); setError(''); }}>
            Clear
          </button>
        </div>
        {error && <div className="mt-3 text-sm text-rose-600">⚠️ {error}</div>}
      </section>

      <section className="space-y-4">
        {!result && !busy && (
          <div className="card text-center text-slate-500 text-sm">
            Generate bundles, cross-sells, and a merchandising plan for any product.
          </div>
        )}

        {result?.tagline && (
          <div className="card bg-gradient-to-br from-brand-50 to-white">
            <div className="label">Tagline</div>
            <div className="text-xl font-extrabold text-slate-900">"{result.tagline}"</div>
          </div>
        )}

        {result?.bundles?.length > 0 && (
          <div className="card">
            <div className="label">Bundles</div>
            <ul className="space-y-2">
              {result.bundles.map((b, i) => (
                <li key={i} className="rounded-xl bg-white ring-1 ring-brand-100 p-3 text-sm">
                  <div className="font-semibold text-slate-800">{b.name}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{b.items?.join(' + ')}</div>
                  {b.pitch && <div className="text-xs italic text-brand-700 mt-1">"{b.pitch}"</div>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result?.crossSell?.length > 0 && (
          <div className="card">
            <div className="label">Cross-Sell</div>
            <ul className="space-y-2">
              {result.crossSell.map((c, i) => (
                <li key={i} className="rounded-xl bg-white ring-1 ring-brand-100 p-3 text-sm">
                  <div className="font-semibold text-slate-800">{c.product}</div>
                  <div className="text-xs text-slate-600">{c.why}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result?.upSell?.length > 0 && (
          <div className="card">
            <div className="label">Up-Sell</div>
            <ul className="space-y-2">
              {result.upSell.map((u, i) => (
                <li key={i} className="rounded-xl bg-white ring-1 ring-brand-100 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-800">{u.product}</div>
                    {u.priceDelta ? <div className="text-brand-700 font-bold">+${u.priceDelta}</div> : null}
                  </div>
                  <div className="text-xs text-slate-600">{u.why}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result?.displayTip && (
          <div className="card">
            <div className="label">Display Tip</div>
            <p className="text-sm text-slate-700">{result.displayTip}</p>
          </div>
        )}
      </section>
    </div>
  );
}
