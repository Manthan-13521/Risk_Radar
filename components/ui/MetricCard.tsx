export function MetricCard({
  label,
  value,
  subLabel,
  color = '#111111',
  icon,
}: {
  label: string;
  value: string | number;
  subLabel?: string;
  color?: string;
  icon?: string;
}) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col justify-between shadow-sm"
      style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase font-extrabold tracking-widest" style={{ color: '#554B49' }}>{label}</div>
        {icon && <span className="text-sm opacity-70">{icon}</span>}
      </div>
      <div className="text-3xl font-extrabold font-mono" style={{ color }}>{value}</div>
      {subLabel && <div className="text-xs mt-1 font-medium" style={{ color: '#554B49' }}>{subLabel}</div>}
    </div>
  );
}