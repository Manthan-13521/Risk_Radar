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
        className="px-3.5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50 border shadow-xs"
        style={{
          background: status === 'investigating' ? '#B86A00' : '#ECE6E2',
          color: status === 'investigating' ? '#ffffff' : '#B86A00',
          borderColor: '#B86A00',
        }}
      >
        Mark Investigating
      </button>
      <button
        onClick={() => handleUpdate('contained', 'Threat simulated quarantine enacted')}
        disabled={loading || status === 'contained'}
        className="px-3.5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50 border shadow-xs"
        style={{
          background: status === 'contained' ? '#990011' : '#ECE6E2',
          color: status === 'contained' ? '#ffffff' : '#990011',
          borderColor: '#990011',
        }}
      >
        Mark Contained
      </button>
      <button
        onClick={() => handleUpdate('resolved', 'Analyst marked incident as remediated')}
        disabled={loading || status === 'resolved'}
        className="px-3.5 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50 border shadow-xs"
        style={{
          background: status === 'resolved' ? '#176B52' : '#ECE6E2',
          color: status === 'resolved' ? '#ffffff' : '#176B52',
          borderColor: '#176B52',
        }}
      >
        Mark Resolved
      </button>
    </div>
  );
}
