'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function IncidentActions({
  incidentId,
  currentStatus,
}: {
  incidentId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const handleUpdate = async (newStatus: string, actionNote?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, actionTaken: actionNote }),
      });
      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => handleUpdate('investigating', 'Analyst actively investigating')}
        disabled={loading || status === 'investigating'}
        className="px-3 py-1.5 bg-blue-900/60 hover:bg-blue-800 disabled:opacity-50 text-blue-200 text-xs font-semibold rounded border border-blue-700/50 transition"
      >
        Mark Investigating
      </button>
      <button
        onClick={() => handleUpdate('contained', 'Threat simulated quarantine enacted')}
        disabled={loading || status === 'contained'}
        className="px-3 py-1.5 bg-amber-900/60 hover:bg-amber-800 disabled:opacity-50 text-amber-200 text-xs font-semibold rounded border border-amber-700/50 transition"
      >
        Mark Contained
      </button>
      <button
        onClick={() => handleUpdate('resolved', 'Analyst marked incident as remediated')}
        disabled={loading || status === 'resolved'}
        className="px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-800 disabled:opacity-50 text-emerald-200 text-xs font-semibold rounded border border-emerald-700/50 transition"
      >
        Mark Resolved
      </button>
    </div>
  );
}
