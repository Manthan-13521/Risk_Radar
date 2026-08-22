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
    healthy: { dot: '#176B52', text: '#176B52', bg: 'rgba(23,107,82,0.06)', border: 'rgba(23,107,82,0.2)', title: 'OPERATIONAL' },
    degraded: { dot: '#B86A00', text: '#B86A00', bg: 'rgba(184,106,0,0.06)', border: 'rgba(184,106,0,0.2)', title: 'DEGRADED' },
    offline: { dot: '#990011', text: '#990011', bg: 'rgba(153,0,17,0.06)', border: 'rgba(153,0,17,0.2)', title: 'OFFLINE' },
    not_configured: { dot: '#6F6664', text: '#6F6664', bg: '#F0E8E6', border: '#D5C8C5', title: 'NOT CONFIGURED' },
  };

  const cfg = statusConfig[status];

  return (
    <div
      className="flex items-center justify-between p-4 rounded-xl border transition hover:bg-white/30"
      style={{ background: cfg.bg, borderColor: cfg.border }}
    >
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.dot }} />
        <div>
          <div className="text-sm font-bold" style={{ color: '#111111' }}>{label}</div>
          {detail && <div className="text-xs font-mono mt-0.5" style={{ color: '#6F6664' }}>{detail}</div>}
        </div>
      </div>
      <span
        className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded border"
        style={{ background: '#FCF6F5', borderColor: cfg.border, color: cfg.text }}
      >
        {cfg.title}
      </span>
    </div>
  );
}