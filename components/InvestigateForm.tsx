"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function InvestigateForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [inputType, setInputType] = useState('message');

  useEffect(() => {
    const urlContent = searchParams?.get('content');
    const urlType = searchParams?.get('type');
    if (urlContent) setContent(urlContent);
    if (urlType) setInputType(urlType);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/investigate', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Investigation failed');
      }

      const data = await res.json();
      router.push(`/investigate/${data.id}`);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste URL or message..."
          className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input type="hidden" name="type" value="message" />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-sm font-medium px-4 py-2 rounded transition"
        >
          {loading ? '...' : 'Investigate'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="radio"
            name="type"
            value="message"
            checked={inputType === 'message'}
            onChange={() => setInputType('message')}
            className="form-radio text-blue-600 bg-zinc-800 border-zinc-700"
          />
          <span>Message / URL</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="radio"
            name="type"
            value="file"
            checked={inputType === 'file'}
            onChange={() => setInputType('file')}
            className="form-radio text-blue-600 bg-zinc-800 border-zinc-700"
          />
          <span>File Upload</span>
        </label>
      </div>

      {inputType !== 'file' && (
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          rows={5}
          placeholder="Paste email, SMS, URL, or message content here..."
        />
      )}

      {inputType === 'file' && (
        <div className="p-4 border-2 border-dashed border-zinc-700 rounded-md bg-zinc-950 flex flex-col items-center justify-center">
          <input
            type="file"
            name="file"
            className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-200 hover:file:bg-blue-800 cursor-pointer"
          />
          <p className="text-xs text-zinc-500 mt-2">Max 10MB. Inspects metadata — does not execute files.</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:text-zinc-400 text-white font-medium py-3 rounded-md transition shadow-lg shadow-blue-900/20"
      >
        {loading ? 'Investigating...' : 'Investigate'}
      </button>
    </form>
  );
}
