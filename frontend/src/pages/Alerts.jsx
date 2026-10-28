import Layout from '../components/Layout';
import { StatCard } from '../components/Navbar';
import { useAlerts } from '../hooks/useAlerts';

export default function Alerts() {
  const {
    alerts,
    highRiskCount,
    mediumRiskCount,
    securityScore,
    addAlert,
    resolveAlert,
    simulateSecurityAlert,
    socketConnected,
  } = useAlerts();

  // Upgraded trigger: broadcasts across Socket.IO backend to all tabs and persists to Atlas
  async function simulateAttack() {
    try {
      await simulateSecurityAlert({
        risk: 'high',
        severity: 'high',
        type: 'Suspicious Activity',
        title: 'Simulated brute-force attempt',
        message: '5 failed logins from account "unknown" within 5 minutes.',
        detail: '5 failed logins from account "unknown" within 5 minutes.',
      });
    } catch {
      // Local fallback
      addAlert({
        risk: 'high',
        title: 'Simulated brute-force attempt',
        detail: '5 failed logins from account "unknown" within 5 minutes.',
      });
    }
  }

  return (
    <Layout
      title="Security Alerts"
      statusText={
        highRiskCount
          ? `${highRiskCount} high-risk alert`
          : socketConnected
          ? 'WebSocket: Live & Synced'
          : 'No high-risk alerts'
      }
      statusColor={highRiskCount ? 'red' : 'green'}
    >
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                socketConnected ? 'bg-green pulse-dot' : 'bg-red'
              }`}
            />
            <p className="text-dim text-sm">
              Live Alert Bus: {socketConnected ? 'Connected via Socket.IO' : 'Disconnected'}
            </p>
          </div>
          <h2 className="text-2xl font-bold mt-1">{alerts.length} alerts need a look.</h2>
        </div>
        <button
          onClick={simulateAttack}
          className="bg-red text-bg text-sm font-semibold px-4 py-2 rounded-md hover:bg-red/90 transition flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-bg" />
          Simulate Attack (Broadcast Live)
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="High Risk" value={highRiskCount} valueClass="text-red" />
        <StatCard label="Medium Risk" value={mediumRiskCount} valueClass="text-amber" />
        <StatCard label="Security Score" value={securityScore} valueClass="text-cyan" />
      </div>

      <div className="space-y-3">
        {alerts.length === 0 && <p className="text-dim text-sm">All clear — no active alerts.</p>}
        {alerts.map((a) => {
          const color = (a.risk || a.severity) === 'high' ? 'red' : 'amber';
          return (
            <div
              key={a.id}
              className="bg-surface border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition hover:border-border/80"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className={`w-2.5 h-2.5 rounded-full bg-${color} pulse-dot shrink-0`} />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{a.title}</p>
                    <span
                      className={`font-mono text-[10px] uppercase bg-${color}/15 text-${color} px-1.5 py-0.5 rounded font-bold`}
                    >
                      {a.risk || a.severity || 'medium'} risk
                    </span>
                    {a.type && (
                      <span className="font-mono text-[10px] text-dim bg-surface2 px-1.5 py-0.5 rounded border border-border">
                        {a.type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-dim mt-1">{a.detail || a.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs text-dim">{a.meta || a.timestamp}</span>
                <button
                  onClick={() => resolveAlert(a.id)}
                  className="text-xs border border-border rounded-md px-3 py-1.5 text-dim hover:text-text hover:border-cyan/40 transition"
                >
                  Resolve
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
