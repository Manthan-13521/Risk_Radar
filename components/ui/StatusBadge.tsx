export function StatusBadge({
  classification,
  className = '',
}: {
  classification: 'safe' | 'suspicious' | 'dangerous' | 'critical' | string;
  className?: string;
}) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    safe: { bg: 'rgba(23,107,82,0.1)', color: '#176B52', border: 'rgba(23,107,82,0.3)' },
    suspicious: { bg: 'rgba(184,106,0,0.1)', color: '#B86A00', border: 'rgba(184,106,0,0.3)' },
    dangerous: { bg: 'rgba(153,0,17,0.1)', color: '#990011', border: 'rgba(153,0,17,0.3)' },
    critical: { bg: 'rgba(118,0,13,0.12)', color: '#76000D', border: 'rgba(118,0,13,0.4)' },
  };

  const style = map[classification] ?? { bg: '#E7DEDC', color: '#6F6664', border: '#D5C8C5' };

  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-flex items-center gap-1.5 ${className}`}
      style={{ background: style.bg, color: style.color, borderColor: style.border }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {classification}
    </span>
  );
}