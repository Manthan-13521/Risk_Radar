export function StatusBadge({
  classification,
  className = '',
}: {
  classification: 'safe' | 'suspicious' | 'dangerous' | 'critical' | string;
  className?: string;
}) {
  const map: Record<string, string> = {
    safe: 'bg-green-950/80 text-green-300 border-green-800/60',
    suspicious: 'bg-yellow-950/80 text-yellow-300 border-yellow-800/60',
    dangerous: 'bg-orange-950/80 text-amber-300 border-orange-800/60',
    critical: 'bg-red-950/80 text-red-300 border-red-800/60',
  };

  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-flex items-center gap-1 ${
        map[classification] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          classification === 'safe'
            ? 'bg-green-400'
            : classification === 'suspicious'
            ? 'bg-yellow-400'
            : classification === 'dangerous'
            ? 'bg-amber-400'
            : 'bg-red-400 animate-pulse'
        }`}
      />
      {classification}
    </span>
  );
}