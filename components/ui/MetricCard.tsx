export function MetricCard({
  label,
  value,
  subLabel,
  color = 'text-white',
  icon,
}: {
  label: string;
  value: string | number;
  subLabel?: string;
  color?: string;
  icon?: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col justify-between hover:border-zinc-700 transition">
      <div className="flex items-center justify-between">
        <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{label}</div>
        {icon && <span className="text-sm opacity-60">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold font-mono my-1 ${color}`}>{value}</div>
      {subLabel && <div className="text-xs text-zinc-500">{subLabel}</div>}
    </div>
  );
}