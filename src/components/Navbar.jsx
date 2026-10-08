export function Navbar({ title, statusText = 'All systems healthy', statusColor = 'green' }) {
  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-8 sticky top-0 bg-bg/90 backdrop-blur z-20">
      <h1 className="text-sm font-semibold">{title}</h1>
      <div className="flex items-center gap-4">
        <span className={`hidden sm:flex items-center gap-2 font-mono text-xs text-${statusColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-${statusColor} pulse-dot`} />
          {statusText}
        </span>
      </div>
    </header>
  );
}

export function StatCard({ label, value, valueClass = '', hint, hintClass = 'text-dim' }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-5">
      <p className="text-xs text-dim mb-2">{label}</p>
      <p className={`text-2xl font-bold font-mono ${valueClass}`}>{value}</p>
      {hint && <p className={`text-xs mt-1 ${hintClass}`}>{hint}</p>}
    </div>
  );
}
