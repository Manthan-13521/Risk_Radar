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
        className="px-4 py-2 text-xs font-extrabold text-white rounded-xl transition hover:opacity-90 shadow-sm"
        style={{ background: '#990011' }}
      >
        + Add Knowledge Fact
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
        style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}
      >
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#C4B5B0' }}>
          <h3 className="text-sm font-extrabold uppercase" style={{ color: '#111111' }}>Add Security Knowledge Fact</h3>
          <button onClick={() => setOpen(false)} className="p-1 rounded text-xs font-bold" style={{ color: '#554B49' }}>
            ✕
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg text-xs font-bold" style={{ background: 'rgba(153,0,17,0.08)', border: '1px solid rgba(153,0,17,0.2)', color: '#990011' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold mb-1" style={{ color: '#554B49' }}>Fact / Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl p-2.5 border font-medium"
              style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#111111', outline: 'none' }}
              placeholder="e.g. Internal Payroll Domain"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1" style={{ color: '#554B49' }}>Fact Type</label>
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
                className="w-full rounded-xl p-2.5 border font-medium"
                style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#111111' }}
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
              <label className="block font-bold mb-1" style={{ color: '#554B49' }}>Severity Baseline</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                className="w-full rounded-xl p-2.5 border font-medium"
                style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#111111' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1" style={{ color: '#554B49' }}>Target Value / Domain / Pattern</label>
            <input
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-xl p-2.5 border font-mono font-bold"
              style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#990011', outline: 'none' }}
              placeholder="e.g. payroll.internal-company.com"
            />
          </div>

          <div>
            <label className="block font-bold mb-1" style={{ color: '#554B49' }}>Description / Context</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl p-2.5 border resize-y font-medium"
              style={{ background: '#ECE6E2', borderColor: '#C4B5B0', color: '#111111', outline: 'none' }}
              placeholder="Operational justification for this rule..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-xl font-bold border"
              style={{ background: '#E0D8D4', borderColor: '#C4B5B0', color: '#111111' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl text-white font-extrabold transition hover:opacity-90 disabled:opacity-50 shadow-sm"
              style={{ background: '#990011' }}
            >
              {loading ? 'Adding...' : 'Save Knowledge Fact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
