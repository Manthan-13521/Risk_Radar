'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AddKnowledgeModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<
    'trusted_domain' | 'brand_identity' | 'scam_pattern' | 'dna_pattern' | 'suspicious_phrase' | 'false_positive'
  >('trusted_domain');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('low');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          description,
          value,
          severity,
          tags: [type],
          source: 'analyst_console',
          enabled: true,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create knowledge entry');
      }

      setOpen(false);
      setName('');
      setDescription('');
      setValue('');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating entry');
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
        + Add Knowledge Fact
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Add Security Knowledge Fact</h3>
          <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white text-xs">
            ✕
          </button>
        </div>

        {error && <div className="p-2 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Fact / Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
              placeholder="e.g. Internal Payroll Domain"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1">Fact Type</label>
              <select
                value={type}
                onChange={(e) =>
                  setType(
                    e.target.value as
                      | 'trusted_domain'
                      | 'brand_identity'
                      | 'scam_pattern'
                      | 'dna_pattern'
                      | 'suspicious_phrase'
                      | 'false_positive'
                  )
                }
                className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
              >
                <option value="trusted_domain">Trusted Domain</option>
                <option value="brand_identity">Brand Identity</option>
                <option value="scam_pattern">Scam Pattern</option>
                <option value="dna_pattern">DNA Pattern</option>
                <option value="suspicious_phrase">Suspicious Phrase</option>
                <option value="false_positive">False Positive</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Severity Baseline</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Target Value / Domain / Pattern</label>
            <input
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white font-mono"
              placeholder="e.g. payroll.internal-company.com"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Description / Context</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
              placeholder="Operational justification for this rule..."
            />
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
              {loading ? 'Adding...' : 'Save Knowledge Fact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
