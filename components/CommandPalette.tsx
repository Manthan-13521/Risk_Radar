'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CommandItem {
  title: string;
  category: string;
  href: string;
  icon: string;
  shortcut?: string;
}

const COMMANDS: CommandItem[] = [
  { title: 'Executive Dashboard', category: 'Navigation', href: '/', icon: '⬡' },
  { title: 'Investigation Center', category: 'Navigation', href: '/investigate', icon: '🔍' },
  { title: 'Incident Response Center', category: 'Navigation', href: '/incidents', icon: '🚨' },
  { title: 'Scan History', category: 'Navigation', href: '/history', icon: '📋' },
  { title: 'Threat DNA Explorer', category: 'Navigation', href: '/threat-dna', icon: '🧬' },
  { title: 'Threat Intelligence', category: 'Navigation', href: '/intelligence', icon: '🌐' },
  { title: 'Security Policies', category: 'Governance', href: '/policies', icon: '🛡' },
  { title: 'Knowledge Center', category: 'Governance', href: '/knowledge', icon: '📚' },
  { title: 'Evaluation & Benchmark Lab', category: 'Governance', href: '/evaluation', icon: '🧪' },
  { title: 'Immutable Audit Logs', category: 'Governance', href: '/audit-logs', icon: '📜' },
  { title: 'AI System Health', category: 'AI System', href: '/ai-health', icon: '🤖' },
  { title: 'AI Model Center', category: 'AI System', href: '/ai-models', icon: '⚙️' },
  { title: 'Voice Assistant Briefings', category: 'AI System', href: '/voice', icon: '🔊' },
  { title: 'WhatsApp Security Gateway', category: 'Integrations', href: '/integrations/whatsapp', icon: '💬' },
  { title: 'System Infrastructure Health', category: 'System', href: '/system', icon: '❤️' },
  { title: 'Platform Settings', category: 'System', href: '/settings', icon: '⚙' },
  // Quick Scenarios
  { title: 'Run Demo: PayPal Phishing Attack', category: 'Quick Demo', href: '/investigate?type=url&content=https%3A%2F%2Fpaypa1-security.example.invalid%2Flogin', icon: '⚡' },
  { title: 'Run Demo: Package Delivery Scam', category: 'Quick Demo', href: '/investigate?type=message&content=Your%20package%20could%20not%20be%20delivered.%20Pay%20a%20%E2%82%B949%20redelivery%20fee%20immediately.', icon: '⚡' },
  { title: 'Run Demo: Credential Theft Urgency', category: 'Quick Demo', href: '/investigate?type=message&content=FINAL%20WARNING%3A%20Verify%20your%20HDFC%20banking%20account%20today%20or%20access%20will%20be%20disabled.', icon: '⚡' },
];

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!open) return null;

  const filtered = COMMANDS.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 bg-zinc-950/60 gap-3">
          <span className="text-zinc-400 text-lg">🔍</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((i) => Math.min(filtered.length - 1, i + 1));
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((i) => Math.max(0, i - 1));
              }
              if (e.key === 'Enter' && filtered[selectedIndex]) {
                e.preventDefault();
                handleSelect(filtered[selectedIndex].href);
              }
            }}
            placeholder="Search commands, pages, intelligence, demo scans..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800 border border-zinc-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No matching commands or pages found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.href + item.title}
                  onClick={() => handleSelect(item.href)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left text-xs transition ${
                    isSelected
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'text-zinc-300 hover:bg-zinc-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{item.icon}</span>
                    <div>
                      <div className="font-medium text-white">{item.title}</div>
                      <div className="text-[10px] text-zinc-500">{item.category}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">↵ Jump</span>
                </button>
              );
            })
          )}
        </div>

        {/* Command Palette Footer */}
        <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>•</span>
            <span>↵ Select</span>
            <span>•</span>
            <span>ESC Close</span>
          </div>
          <span>ShieldSense Command Center</span>
        </div>
      </div>
    </div>
  );
}
