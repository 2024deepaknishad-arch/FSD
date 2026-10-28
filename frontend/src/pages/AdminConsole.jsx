import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { StatCard } from '../components/Navbar';

export default function AdminConsole() {
  const { user, role, isAdmin, checkAdminAccess, token } = useAuth();
  const [adminApiResult, setAdminApiResult] = useState(null);
  const [testing, setTesting] = useState(false);

  // Automatically check admin access when mounting
  useEffect(() => {
    testEndpoint();
  }, []);

  async function testEndpoint() {
    setTesting(true);
    const result = await checkAdminAccess();
    setAdminApiResult(result);
    setTesting(false);
  }

  return (
    <Layout
      title="Admin Security Console"
      statusText={isAdmin ? 'Administrator Privileges Active' : 'Restricted Role: User'}
      statusColor={isAdmin ? 'cyan' : 'amber'}
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs uppercase px-2 py-0.5 rounded font-bold ${
                isAdmin ? 'bg-cyan/20 text-cyan border border-cyan/40' : 'bg-amber/20 text-amber border border-amber/40'
              }`}
            >
              {role.toUpperCase()} ROLE
            </span>
            <p className="text-dim text-sm">RBAC Authorization Verification</p>
          </div>
          <h2 className="text-2xl font-bold mt-1">Privileged Access Control Center</h2>
        </div>

        <button
          onClick={testEndpoint}
          disabled={testing}
          className="bg-cyan text-bg text-sm font-semibold px-4 py-2 rounded-md hover:bg-cyan/90 transition disabled:opacity-60"
        >
          {testing ? 'Verifying with API…' : 'Re-test GET /api/users/admin'}
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Authenticated User" value={user?.name || 'Unknown'} />
        <StatCard
          label="Verified RBAC Role"
          value={role.toUpperCase()}
          valueClass={isAdmin ? 'text-cyan' : 'text-amber'}
        />
        <StatCard
          label="Admin Access Status"
          value={isAdmin ? '200 OK (Allowed)' : '403 Forbidden'}
          valueClass={isAdmin ? 'text-green' : 'text-red'}
          hint={isAdmin ? 'Privileged route accessible' : 'Blocked by authorizeRoles("admin")'}
          hintClass={isAdmin ? 'text-green' : 'text-red'}
        />
      </div>

      {/* RBAC Verification Live Response Panel */}
      <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-semibold text-sm">Live Backend Authorization Check (`GET /api/users/admin`)</h3>
          {adminApiResult && (
            <span
              className={`font-mono text-xs px-2.5 py-1 rounded font-bold ${
                adminApiResult.ok ? 'bg-green/15 text-green border border-green/30' : 'bg-red/15 text-red border border-red/30'
              }`}
            >
              HTTP {adminApiResult.status} {adminApiResult.ok ? 'OK' : 'FORBIDDEN'}
            </span>
          )}
        </div>

        {adminApiResult ? (
          <div>
            {adminApiResult.ok ? (
              <div className="bg-green/10 border border-green/30 rounded-lg p-4 text-xs text-text space-y-2">
                <p className="text-green font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green" />
                  Privileged Admin Access Granted: JWT contains role: "admin"
                </p>
                <p className="text-dim">
                  The backend verified your JWT signature and confirmed that <code>req.user.role === 'admin'</code> via <code>authorizeRoles('admin')</code> middleware.
                </p>
              </div>
            ) : (
              <div className="bg-red/10 border border-red/30 rounded-lg p-4 text-xs text-text space-y-2">
                <p className="text-red font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red" />
                  Access Forbidden (403): User Role Insufficient
                </p>
                <p className="text-dim">
                  Your JWT is valid (Authentication passed), but your role is <code>"{role}"</code>. The <code>authorizeRoles('admin')</code> middleware correctly denied access to this privileged route.
                </p>
              </div>
            )}

            <div className="mt-4">
              <p className="text-xs font-mono text-dim mb-1">Server JSON Response:</p>
              <pre className="bg-surface2 p-3 rounded font-mono text-xs text-text overflow-x-auto border border-border">
                {JSON.stringify(adminApiResult.data || adminApiResult.error, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-xs text-dim">Sending authorization check request to server…</p>
        )}
      </div>

      {/* Privileged Controls - Visible only to Admin */}
      {isAdmin ? (
        <div className="bg-surface border border-cyan/30 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan pulse-dot" />
            <h3 className="font-semibold text-sm text-cyan">Administrator Master Controls</h3>
          </div>
          <p className="text-xs text-dim">
            These system controls are only unlocked when authenticated with an Admin JWT.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-surface2 p-3 rounded border border-border">
              <p className="font-medium">Threat Mitigation Engine</p>
              <p className="text-dim text-[11px] mt-0.5">Status: Auto-blocking suspicious IPs active</p>
            </div>
            <div className="bg-surface2 p-3 rounded border border-border">
              <p className="font-medium">Audit Pipeline Override</p>
              <p className="text-dim text-[11px] mt-0.5">Status: Administrative bypass enabled</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface/50 border border-dashed border-border rounded-lg p-6 text-center text-dim text-xs">
          🔒 Administrator master controls are locked. Log in as an administrator (<code className="text-text">admin@cyberaudit.com</code>) to unlock.
        </div>
      )}
    </Layout>
  );
}
