export default function Header({ feature }) {
  return (
    <header className="flex items-center justify-between border-b border-brand-100 bg-white/60 backdrop-blur px-6 lg:px-10 py-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{feature?.icon}</span>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">{feature?.name}</h1>
          <p className="text-xs text-slate-500">{feature?.desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="chip">groq</span>
        <span className="chip">llama-3.3-70b</span>
        <span className="chip">snowflake</span>
      </div>
    </header>
  );
}
