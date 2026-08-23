export const dynamic = 'force-dynamic';

import { getServerAuthSession } from '@/lib/auth/auth-options';

export default async function SettingsPage() {
  const session = await getServerAuthSession();
  const user = session?.user;

  const nodeEnv = process.env.NODE_ENV || 'development';
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
  const hasMongo = Boolean(process.env.MONGODB_URI);
  const hasGoogleAuth = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const hasAuthSecret = Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET);
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY);
  const hasWhatsApp = Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID);

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-8" style={{ background: '#ECE6E2' }}>
      {/* Header */}
      <div className="border-b pb-6" style={{ borderColor: '#C4B5B0' }}>
        <div className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: '#990011' }}>Platform & Account Settings</div>
        <h1 className="text-3xl font-extrabold" style={{ color: '#111111' }}>SETTINGS & USER PROFILE</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: '#554B49' }}>
          Personal security profile, authentication posture, and platform environment configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Account Profile */}
        <div className="rounded-2xl border p-6 space-y-4 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#111111' }}>
            User Identity & Security
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between p-3 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>Operator Name</span>
              <span className="font-bold" style={{ color: '#111111' }}>{user?.name || 'Security Operator'}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>Email</span>
              <span className="font-bold" style={{ color: '#111111' }}>{user?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>Assigned Role</span>
              <span className="font-bold" style={{ color: user?.role === 'ADMIN' ? '#990011' : '#176B52' }}>
                {user?.role || 'USER'}
              </span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>Stable User ID</span>
              <span className="truncate max-w-[180px] font-bold" style={{ color: '#554B49' }}>{user?.id || 'session-bound'}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>Multi-Tenancy Status</span>
              <span className="font-bold" style={{ color: '#176B52' }}>Personal Workspace (Tenant-Ready)</span>
            </div>
          </div>
        </div>

        {/* Environment Details */}
        <div className="rounded-2xl border p-6 space-y-4 shadow-sm" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#111111' }}>
            Authentication & Runtime
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between p-3 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>Environment</span>
              <span className="font-bold uppercase" style={{ color: '#111111' }}>{nodeEnv}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>Auth Framework</span>
              <span className="font-bold" style={{ color: '#176B52' }}>Auth.js (NextAuth v4) + JWT</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>Session Key</span>
              <span className="font-bold" style={{ color: hasAuthSecret ? '#176B52' : '#B86A00' }}>
                {hasAuthSecret ? 'Active (AUTH_SECRET)' : 'Default Key'}
              </span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>Google OAuth</span>
              <span className="font-bold" style={{ color: hasGoogleAuth ? '#176B52' : '#554B49' }}>
                {hasGoogleAuth ? 'Configured & Active' : 'Requires Env Setup'}
              </span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>Database Engine</span>
              <span className="font-bold" style={{ color: hasMongo ? '#176B52' : '#B86A00' }}>
                {hasMongo ? 'MongoDB Atlas (Connected)' : 'Not Configured'}
              </span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>AI Model</span>
              <span className="truncate max-w-xs font-bold" style={{ color: '#990011' }}>{model}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl border shadow-xs" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <span style={{ color: '#554B49' }}>Voice & WhatsApp</span>
              <span className="font-bold" style={{ color: hasOpenAi || hasWhatsApp ? '#176B52' : '#554B49' }}>
                Voice: Web Speech | WhatsApp: {hasWhatsApp ? 'Active' : 'Standby'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Engine Directives */}
        <div className="rounded-2xl border p-6 space-y-4 shadow-sm md:col-span-2" style={{ background: '#E0D8D4', borderColor: '#C4B5B0' }}>
          <div className="text-xs font-extrabold uppercase tracking-widest" style={{ color: '#111111' }}>
            Zero-Trust Isolation Directives
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed font-medium">
            <div className="p-4 rounded-xl border shadow-xs space-y-1" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <div className="font-bold" style={{ color: '#111111' }}>User-Scoped Telemetry</div>
              <p style={{ color: '#554B49' }}>
                Every investigation, incident, and audit record is strictly filtered by session userId on the server.
              </p>
            </div>
            <div className="p-4 rounded-xl border shadow-xs space-y-1" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <div className="font-bold" style={{ color: '#111111' }}>Password Security</div>
              <p style={{ color: '#554B49' }}>
                Salted bcrypt password hashes are strictly preserved server-side and never returned over API endpoints.
              </p>
            </div>
            <div className="p-4 rounded-xl border shadow-xs space-y-1" style={{ background: '#ECE6E2', borderColor: '#C4B5B0' }}>
              <div className="font-bold" style={{ color: '#111111' }}>Authoritative Policy Guard</div>
              <p style={{ color: '#554B49' }}>
                Deterministic heuristic guardrails enforce minimum risk overrides regardless of AI model variations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
