export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b" style={{ borderColor: '#C4B5B0' }}>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-sm mt-1 font-medium" style={{ color: '#554B49' }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}