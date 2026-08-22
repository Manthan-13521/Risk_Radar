'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PolicyToggle({
  policyId,
  initialEnabled,
}: {
  policyId: string;
  initialEnabled: boolean;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/policies/${policyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });
      if (res.ok) {
        setEnabled(!enabled);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
      style={{ background: enabled ? '#990011' : '#D5C8C5' }}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function AddPolicyModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inputType, setInputType] = useState<'url' | 'message' | 'file' | 'any'>('url');
  const [action, setAction] = useState<'allow' | 'warn' | 'quarantine' | 'block'>('block');
  const [minimumRisk, setMinimumRisk] = useState(70);
  const [priority, setPriority] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          inputType,
          action,
          minimumRisk: Number(minimumRisk),
          priority: Number(priority),
          enabled: true,
          conditions: [{ signal: 'custom_rule', operator: 'equals', value: true }],
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create policy');
      }

      setOpen(false);
      setName('');
      setDescription('');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating policy');
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-xs font-bold text-white rounded-xl transition hover:opacity-90"
        style={{ background: '#990011' }}
      >
        + Add Policy
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(17,17,17,0.6)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="rounded-2xl border p-6 max-w-md w-full space-y-4 shadow-2xl"
        style={{ background: '#FCF6F5', borderColor: '#D5C8C5' }}
      >
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#D5C8C5' }}>
          <h3 className="text-sm font-extrabold uppercase" style={{ color: '#111111' }}>Create Security Policy</h3>
          <button onClick={() => setOpen(false)} className="p-1 rounded text-xs" style={{ color: '#6F6664' }}>
            ✕
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg text-xs" style={{ background: 'rgba(153,0,17,0.08)', border: '1px solid rgba(153,0,17,0.2)', color: '#990011' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold mb-1" style={{ color: '#6F6664' }}>Policy Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl p-2.5 border"
              style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#111111', outline: 'none' }}
              placeholder="e.g. Domain Reputation Guard"
            />
          </div>

          <div>
            <label className="block font-bold mb-1" style={{ color: '#6F6664' }}>Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl p-2.5 border resize-y"
              style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#111111', outline: 'none' }}
              placeholder="What this policy guards against..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1" style={{ color: '#6F6664' }}>Input Target</label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value as 'url' | 'message' | 'file' | 'any')}
                className="w-full rounded-xl p-2.5 border"
                style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#111111' }}
              >
                <option value="url">URL</option>
                <option value="message">Message</option>
                <option value="file">File</option>
                <option value="any">Any</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1" style={{ color: '#6F6664' }}>Enforced Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as 'allow' | 'warn' | 'quarantine' | 'block')}
                className="w-full rounded-xl p-2.5 border"
                style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#111111' }}
              >
                <option value="warn">Warn</option>
                <option value="quarantine">Quarantine</option>
                <option value="block">Block</option>
                <option value="allow">Allow</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1" style={{ color: '#6F6664' }}>Min Risk Floor (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={minimumRisk}
                onChange={(e) => setMinimumRisk(Number(e.target.value))}
                className="w-full rounded-xl p-2.5 border"
                style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#111111' }}
              />
            </div>
            <div>
              <label className="block font-bold mb-1" style={{ color: '#6F6664' }}>Priority (1 = Highest)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full rounded-xl p-2.5 border"
                style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#111111' }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-xl font-bold border"
              style={{ background: '#F0E8E6', borderColor: '#D5C8C5', color: '#111111' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-white font-bold transition hover:opacity-90 disabled:opacity-50"
              style={{ background: '#990011' }}
            >
              {loading ? 'Creating...' : 'Save Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
