export function HealthIndicator({
  status,
  label,
  detail,
}: {
  status: 'healthy' | 'degraded' | 'offline' | 'not_configured';
  label: string;
  detail?: string;
}) {
  const statusConfig = {
    healthy: { dot: 'bg-emerald-400', text: 'text-emerald-400', badge: 'bg-emerald-950/60 border-emerald-800/40 text-emerald-300', title: 'OPERATIONAL' },
    degraded: { dot: 'bg-yellow-400', text: 'text-yellow-400', badge: 'bg-yellow-950/60 border-yellow-800/40 text-yellow-300', title: 'DEGRADED' },
    offline: { dot: 'bg-red-400', text: 'text-red-400', badge: 'bg-red-950/60 border-red-800/40 text-red-300', title: 'OFFLINE' },
    not_configured: { dot: 'bg-zinc-500', text: 'text-zinc-400', badge: 'bg-zinc-800 border-zinc-700 text-zinc-400', title: 'NOT CONFIGURED' },
  };

  const cfg = statusConfig[status];

  return (
    <div className="flex items-center justify-between p-3.5 bg-zinc-900 border border-zinc-800 rounded-lg">
      <div className="flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${status === 'healthy' ? 'animate-pulse' : ''}`} />
        <div>
          <div className="text-sm font-semibold text-zinc-200">{label}</div>
          {detail && <div className="text-xs text-zinc-500 mt-0.5 font-mono">{detail}</div>}
        </div>
      </div>
      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${cfg.badge}`}>
        {cfg.title}
      </span>
    </div>
  );
}