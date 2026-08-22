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
    <div className="p-12 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex flex-col items-center justify-center">
      <span className="text-3xl mb-3 opacity-60">{icon}</span>
      <h3 className="text-sm font-semibold text-zinc-300">{title}</h3>
      {description && <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">{description}</p>}
      {action}
    </div>
  );
}