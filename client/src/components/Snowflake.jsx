import { useEffect, useState } from 'react';
import { api } from '../api.js';

const SCENARIOS = [
  { id: 'demand', label: 'Demand Forecast' },
  { id: 'anomalies', label: 'Anomaly Detection' },
  { id: 'loyalty', label: 'Loyalty Segments' },
];

export default function Snowflake() {
  const [scenario, setScenario] = useState('demand');
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function loadScenario(nextScenario = scenario) {
    setBusy(true);
    setError('');
    try {
      const result = await api.snowflake(nextScenario);
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadScenario(scenario);
  }, [scenario]);

  return (
    <div className="grid xl:grid-cols-[1.1fr_0.9fr] gap-6">
      <section className="card">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <div className="label">Snowflake + Coco CLI</div>
            <h2 className="text-2xl font-black text-slate-900">{data?.title || 'Snowflake Retail Intelligence'}</h2>
          </div>
          <button className="btn-ghost text-xs" onClick={() => loadScenario()} disabled={busy}>
            {busy ? 'Refreshing…' : 'Refresh demo'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {SCENARIOS.map((item) => (
            <button
              key={item.id}
              onClick={() => setScenario(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                item.id === scenario ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-700 ring-1 ring-brand-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-brand-50 via-white to-violet-50 p-4 ring-1 ring-brand-100">
          <div className="text-sm font-semibold text-brand-700">{data?.scenario || 'Demand Forecasting'}</div>
          <p className="mt-2 text-sm text-slate-700">{data?.headline}</p>
          <p className="mt-3 text-sm text-slate-600">{data?.summary}</p>
        </div>

        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          {data?.metrics?.map((metric) => (
            <div key={metric.label} className="rounded-2xl bg-white ring-1 ring-brand-100 p-4">
              <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{metric.label}</div>
              <div className="mt-2 text-2xl font-black text-slate-900">{metric.value}</div>
              <div className="mt-1 text-xs text-emerald-600 font-medium">{metric.delta}</div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="label">Trend snapshot</div>
          <div className="flex items-end gap-2 h-28 rounded-2xl bg-slate-50 p-3 ring-1 ring-brand-100">
            {data?.chart?.map((bar) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center justify-end gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-violet-400"
                  style={{ height: `${bar.value}%` }}
                  title={`${bar.label}: ${bar.value}`} 
                />
                <span className="text-[10px] text-slate-500">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="card">
          <div className="label">Why Snowflake fits</div>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>• Handles large retail datasets across orders, inventory, and customer behavior.</li>
            <li>• Provides fast SQL analytics for forecasting and anomaly detection.</li>
            <li>• Scales cleanly for dashboards, alerts, and warehouse automation.</li>
          </ul>
        </div>

        <div className="card">
          <div className="label">What Coco CLI adds</div>
          <p className="text-sm text-slate-700">
            Coco CLI acts as a lightweight command-line workflow layer: validate SQL, run a warehouse job, and hand the output to a dashboard or downstream process without manual spreadsheet hops.
          </p>
          <div className="mt-3 rounded-xl bg-slate-950 p-3 text-[11px] text-slate-100 font-mono overflow-auto">
            {data?.cli?.command || 'coco-cli snowflake run --warehouse ANALYTICS_WH --sql "SELECT 1;"'}
          </div>
        </div>

        <div className="card">
          <div className="label">Recommended next steps</div>
          <ul className="space-y-2 text-sm text-slate-700">
            {data?.recommendations?.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-brand-600">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card xl:col-span-2">
        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <div className="label">Sample Snowflake SQL</div>
            <pre className="rounded-2xl bg-slate-950 p-4 text-[11px] leading-6 text-slate-100 overflow-x-auto whitespace-pre-wrap">
              {data?.queries?.join('\n\n') || 'SELECT * FROM RETAIL.POS LIMIT 25;'}
            </pre>
          </div>
          <div>
            <div className="label">Coco CLI flow</div>
            <ol className="space-y-3 text-sm text-slate-700">
              {data?.cli?.steps?.map((step, index) => (
                <li key={step} className="flex gap-3 rounded-xl bg-brand-50 p-3 ring-1 ring-brand-100">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {error && <div className="mt-4 text-sm text-rose-600">⚠️ {error}</div>}
      </section>
    </div>
  );
}
