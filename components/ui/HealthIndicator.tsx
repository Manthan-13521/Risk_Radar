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
    healthy: { dot: 'bg-emerald-400', text: 'text-emerald-400', badge: 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300', title: 'OPERATIONAL' },
    degraded: { dot: 'bg-yellow-400', text: 'text-yellow-400', badge: 'bg-yellow-950/80 border-yellow-700/60 text-yellow-300', title: 'DEGRADED' },
    offline: { dot: 'bg-red-400', text: 'text-red-400', badge: 'bg-red-950/80 border-red-700/60 text-red-300', title: 'OFFLINE' },
    not_configured: { dot: 'bg-zinc-500', text: 'text-zinc-400', badge: 'bg-[#181818] border-zinc-700 text-zinc-400', title: 'NOT CONFIGURED' },
  };

  const cfg = statusConfig[status];

  return (
    <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-[#1c1c1c] rounded-xl hover:border-zinc-700 transition shadow-lg">
      <div className="flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${status === 'healthy' ? 'animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : ''}`} />
        <div>
          <div className="text-sm font-bold text-white">{label}</div>
          {detail && <div className="text-xs text-zinc-400 mt-0.5 font-mono">{detail}</div>}
        </div>
      </div>
      <span className={`text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-md border ${cfg.badge}`}>
        {cfg.title}
      </span>
    </div>
  );
}