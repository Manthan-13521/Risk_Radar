export const dynamic = 'force-dynamic';

import { getPolicies } from '@/lib/policy-service';
import { PolicyToggle, AddPolicyModal } from '@/components/PolicyActions';

export default async function PoliciesPage() {
  const policies = await getPolicies();
  const activeCount = policies.filter(p => p.enabled).length;

  function actionStyle(action: string): { bg: string; color: string } {
    if (action === 'block') return { bg: 'rgba(153,0,17,0.12)', color: '#990011' };
    if (action === 'quarantine') return { bg: 'rgba(184,106,0,0.12)', color: '#B86A00' };
    return { bg: 'rgba(111,102,100,0.12)', color: '#554B49' };
  }

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#ECE6E2' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-6" style={{ borderColor: '#C4B5B0' }}>
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Governance</div>
          <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>SECURITY POLICIES</h1>
          <p className="text-sm mt-1 font-medium" style={{ color: '#554B49' }}>Authoritative deterministic governance rules that override AI reasoning.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl border text-xs font-bold shadow-xs" style={{ background: '#E0D8D4', borderColor: '#C4B5B0', color: '#176B52' }}>
            {activeCount} ACTIVE
          </div>
          <AddPolicyModal />
        </div>
      </div>

      {policies.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div className="text-lg font-extrabold mb-2" style={{ color: '#111111' }}>NO POLICIES CONFIGURED</div>
          <p className="text-sm font-medium" style={{ color: '#554B49' }}>Default policies will be automatically provisioned upon next database initialization.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map(pol => {
            const { bg, color } = actionStyle(pol.action);
            return (
              <div
                key={String(pol._id)}
                className="rounded-xl border p-5 flex flex-col justify-between space-y-4 transition hover:bg-white/40 shadow-sm"
                style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: '#111111' }}>{pol.name}</h3>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold" style={{ background: '#D3C9C5', color: '#554B49' }}>
                        Priority {pol.priority} · Target: {pol.inputType}
                      </span>
                    </div>
                    <PolicyToggle policyId={String(pol._id)} initialEnabled={pol.enabled} />
                  </div>
                  <p className="text-xs leading-relaxed font-medium" style={{ color: '#554B49' }}>{pol.description}</p>
                </div>

                <div className="pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: '#C4B5B0' }}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ color: '#554B49' }}>Action:</span>
                    <span className="font-mono font-extrabold uppercase px-2 py-0.5 rounded text-[10px] shadow-xs" style={{ background: bg, color }}>
                      {pol.action}
                    </span>
                  </div>
                  {pol.minimumRisk !== undefined && (
                    <div className="font-mono text-[11px]" style={{ color: '#554B49' }}>
                      Risk Floor: <span className="font-bold" style={{ color: '#111111' }}>{pol.minimumRisk}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
