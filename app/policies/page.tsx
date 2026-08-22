export const dynamic = 'force-dynamic';

import { getPolicies } from '@/lib/policy-service';
import { PageHeader } from '@/components/ui/PageHeader';
import { PolicyToggle, AddPolicyModal } from '@/components/PolicyActions';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function PoliciesPage() {
  const policies = await getPolicies();

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <PageHeader
        title="Security Policy Center"
        subtitle="Authoritative deterministic governance rules that override or constrain AI model reasoning."
        badge={
          <span className="text-xs bg-blue-950/80 border border-blue-800/60 text-blue-300 px-2.5 py-0.5 rounded font-mono">
            {policies.filter((p) => p.enabled).length} ACTIVE POLICIES
          </span>
        }
        actions={<AddPolicyModal />}
      />

      {policies.length === 0 ? (
        <EmptyState
          icon="🛡"
          title="No Policies Configured"
          description="Default policies will be automatically provisioned upon next database initialization."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((pol) => (
            <div
              key={String(pol._id)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200">{pol.name}</h3>
                    <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                      Priority {pol.priority} • Target: {pol.inputType}
                    </span>
                  </div>
                  <PolicyToggle
                    policyId={String(pol._id)}
                    initialEnabled={pol.enabled}
                  />
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mt-2">{pol.description}</p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">Action:</span>
                  <span
                    className={`font-mono font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                      pol.action === 'block'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : pol.action === 'quarantine'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {pol.action}
                  </span>
                </div>
                {pol.minimumRisk !== undefined && (
                  <div className="text-zinc-500 font-mono text-[11px]">
                    Risk Floor: <span className="text-zinc-300 font-bold">{pol.minimumRisk}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
