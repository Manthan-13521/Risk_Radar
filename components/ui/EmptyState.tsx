export function EmptyState({
  title = 'No records found',
  description,
  icon = '📋',
  action,
}: {
  title?: string;
  description?: string;
  icon?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="p-12 text-center rounded-2xl border flex flex-col items-center justify-center"
      style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}
    >
      <span className="text-3xl mb-3 opacity-60">{icon}</span>
      <h3 className="text-sm font-extrabold uppercase" style={{ color: '#111111' }}>{title}</h3>
      {description && <p className="text-xs max-w-sm mt-1 mb-4" style={{ color: '#6F6664' }}>{description}</p>}
      {action}
    </div>
  );
}