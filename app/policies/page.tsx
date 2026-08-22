export const dynamic = 'force-dynamic';

import { getPolicies } from '@/lib/policy-service';
import { PolicyToggle, AddPolicyModal } from '@/components/PolicyActions';

export default async function PoliciesPage() {
  const policies = await getPolicies();
  const activeCount = policies.filter(p => p.enabled).length;

  function actionStyle(action: string): { bg: string; color: string } {
    if (action === 'block') return { bg: 'rgba(153,0,17,0.1)', color: '#990011' };
    if (action === 'quarantine') return { bg: 'rgba(184,106,0,0.1)', color: '#B86A00' };
    return { bg: 'rgba(111,102,100,0.1)', color: '#6F6664' };
  }

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#FCF6F5' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-6" style={{ borderColor: '#D5C8C5' }}>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Governance</div>
          <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>SECURITY POLICIES</h1>
          <p className="text-sm mt-1" style={{ color: '#6F6664' }}>Authoritative deterministic governance rules that override AI reasoning.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg border text-xs font-bold" style={{ background: '#F0E8E6', borderColor: '#D5C8C5', color: '#176B52' }}>
            {activeCount} ACTIVE
          </div>
          <AddPolicyModal />
        </div>
      </div>

      {policies.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border" style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}>
          <div className="text-lg font-extrabold mb-2" style={{ color: '#111111' }}>NO POLICIES CONFIGURED</div>
          <p className="text-sm" style={{ color: '#6F6664' }}>Default policies will be automatically provisioned upon next database initialization.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map(pol => {
            const { bg, color } = actionStyle(pol.action);
            return (
              <div
                key={String(pol._id)}
                className="rounded-xl border p-5 flex flex-col justify-between space-y-4 transition hover:bg-white/30"
                style={{ background: '#F0E8E6', borderColor: '#D5C8C5' }}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: '#111111' }}>{pol.name}</h3>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded" style={{ background: '#E7DEDC', color: '#6F6664' }}>
                        Priority {pol.priority} · Target: {pol.inputType}
                      </span>
                    </div>
                    <PolicyToggle policyId={String(pol._id)} initialEnabled={pol.enabled} />
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#6F6664' }}>{pol.description}</p>
                </div>

                <div className="pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: '#D5C8C5' }}>
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#6F6664' }}>Action:</span>
                    <span className="font-mono font-bold uppercase px-2 py-0.5 rounded text-[10px]" style={{ background: bg, color }}>
                      {pol.action}
                    </span>
                  </div>
                  {pol.minimumRisk !== undefined && (
                    <div className="font-mono text-[11px]" style={{ color: '#6F6664' }}>
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
