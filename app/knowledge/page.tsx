export const dynamic = 'force-dynamic';

import { getKnowledgeEntries } from '@/lib/knowledge-service';
import { AddKnowledgeModal } from '@/components/KnowledgeActions';

export default async function KnowledgePage() {
  const entries = await getKnowledgeEntries();

  function sevBadge(sev: string) {
    if (sev === 'critical' || sev === 'high') {
      return { bg: 'rgba(153,0,17,0.12)', color: '#990011' };
    }
    if (sev === 'medium') {
      return { bg: 'rgba(184,106,0,0.12)', color: '#B86A00' };
    }
    return { bg: 'rgba(23,107,82,0.12)', color: '#176B52' };
  }

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#ECE6E2' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-6" style={{ borderColor: '#C4B5B0' }}>
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Knowledge Base</div>
          <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>KNOWLEDGE CENTER</h1>
          <p className="text-sm mt-1 font-medium" style={{ color: '#554B49' }}>
            Structured, human-governed security facts, trusted domains, and brand profiles that calibrate investigation evidence.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl border text-xs font-bold shadow-xs" style={{ background: '#E0D8D4', borderColor: '#C4B5B0', color: '#176B52' }}>
            {entries.length} FACTS REGISTERED
          </div>
          <AddKnowledgeModal />
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div className="text-lg font-extrabold mb-2" style={{ color: '#111111' }}>NO KNOWLEDGE ENTRIES REGISTERED</div>
          <p className="text-sm mb-4 font-medium" style={{ color: '#554B49' }}>
            Register known organizational domains, verified brand profiles, and known threat indicators to guide the decision engine.
          </p>
          <AddKnowledgeModal />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => {
            const badge = sevBadge(entry.severity);
            return (
              <div
                key={String(entry._id)}
                className="rounded-xl border p-5 flex flex-col justify-between space-y-4 transition hover:bg-white/40 shadow-sm"
                style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold truncate" style={{ color: '#111111' }}>{entry.name}</h3>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 shadow-xs"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {entry.severity}
                    </span>
                  </div>

                  <div
                    className="text-xs font-mono p-2.5 rounded-xl border break-all mb-2 font-bold"
                    style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#990011' }}
                  >
                    {entry.value}
                  </div>

                  <p className="text-xs leading-relaxed font-medium" style={{ color: '#554B49' }}>{entry.description}</p>
                </div>

                <div className="pt-3 border-t flex items-center justify-between text-[11px] font-medium" style={{ borderColor: '#C4B5B0', color: '#554B49' }}>
                  <span
                    className="font-mono uppercase px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{ background: '#D3C9C5', color: '#111111' }}
                  >
                    {entry.type.replace(/_/g, ' ')}
                  </span>
                  <span>Source: {entry.source}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
