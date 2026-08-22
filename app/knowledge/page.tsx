export const dynamic = 'force-dynamic';

import { getKnowledgeEntries } from '@/lib/knowledge-service';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AddKnowledgeModal } from '@/components/KnowledgeActions';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function KnowledgePage() {
  const entries = await getKnowledgeEntries();

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <PageHeader
        title="Knowledge Center"
        subtitle="Structured, human-governed security facts, trusted domains, and brand profiles that calibrate investigation evidence."
        badge={
          <span className="text-xs bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 px-2.5 py-0.5 rounded font-mono">
            {entries.length} FACTS REGISTERED
          </span>
        }
        actions={<AddKnowledgeModal />}
      />

      {entries.length === 0 ? (
        <EmptyState
          icon="📚"
          title="No Knowledge Entries Registered"
          description="Register known organizational domains, verified brand profiles, and known threat indicators to guide the decision engine."
          action={<AddKnowledgeModal />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <div
              key={String(entry._id)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold text-zinc-200">{entry.name}</h3>
                  <StatusBadge classification={entry.severity} />
                </div>

                <div className="text-xs font-mono text-blue-300 bg-zinc-950/60 p-2 rounded border border-zinc-800 break-all mb-2">
                  {entry.value}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">{entry.description}</p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                <span className="font-mono uppercase bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                  {entry.type.replace(/_/g, ' ')}
                </span>
                <span>Source: {entry.source}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
