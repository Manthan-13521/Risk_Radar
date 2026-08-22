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
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? 'bg-blue-600' : 'bg-zinc-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
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
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-blue-900/20"
      >
        + Add Policy
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Create Security Policy</h3>
          <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white text-xs">
            ✕
          </button>
        </div>

        {error && <div className="p-2 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Policy Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
              placeholder="e.g. Domain Reputation Guard"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Description</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
              placeholder="What this policy guards against..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">Input Target</label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value as 'url' | 'message' | 'file' | 'any')}
                className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
              >
                <option value="url">URL</option>
                <option value="message">Message</option>
                <option value="file">File</option>
                <option value="any">Any</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Enforced Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as 'allow' | 'warn' | 'quarantine' | 'block')}
                className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
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
              <label className="block text-zinc-400 mb-1">Min Risk Floor (0-100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={minimumRisk}
                onChange={(e) => setMinimumRisk(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Priority (1 = Highest)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded"
            >
              {loading ? 'Creating...' : 'Save Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
