export default function Sidebar({ features, active, setActive }) {
  return (
    <aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-brand-100 bg-white/70 backdrop-blur">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-brand-100">
        <div className="h-10 w-10 rounded-xl bg-brand-600 text-white grid place-items-center font-bold shadow-soft">
          RP
        </div>
        <div>
          <div className="font-extrabold text-slate-900 leading-tight">RetailPilot</div>
          <div className="text-xs text-brand-700 font-medium">AI Copilot for Retail</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {features.map((f) => {
          const isActive = f.id === active;
          return (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className={`group w-full flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition
                ${isActive
                  ? 'bg-brand-600 text-white shadow-soft'
                  : 'text-slate-700 hover:bg-brand-50'}`}
            >
              <span className="text-lg leading-none mt-0.5">{f.icon}</span>
              <span className="flex-1">
                <div className="text-sm font-semibold leading-tight">{f.name}</div>
                <div className={`text-[11px] mt-0.5 ${isActive ? 'text-brand-100' : 'text-slate-500'}`}>
                  {f.desc}
                </div>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl bg-gradient-to-br from-brand-50 to-white ring-1 ring-brand-100 p-4">
        <div className="text-xs font-semibold text-brand-700">Powered by</div>
        <div className="text-sm font-bold text-slate-800">Groq</div>
        <div className="text-[11px] text-slate-500 mt-1">llama-3.3-70b-versatile</div>
      </div>
    </aside>
  );
}
