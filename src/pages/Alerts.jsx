import Layout from '../components/Layout';
import { StatCard } from '../components/Navbar';
import { useAlerts } from '../hooks/useAlerts';

export default function Alerts() {
  const { alerts, highRiskCount, mediumRiskCount, securityScore, addAlert, resolveAlert } = useAlerts();

  // Demo trigger for Experiment 3: shows an action changing global state live.
  function simulateAttack() {
    addAlert({
      risk: 'high',
      title: 'Simulated brute-force attempt',
      detail: '5 failed logins from account "unknown" within 5 minutes.',
    });
  }

  return (
    <Layout title="Security Alerts" statusText={highRiskCount ? `${highRiskCount} high-risk alert` : 'No high-risk alerts'} statusColor={highRiskCount ? 'red' : 'green'}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-dim text-sm">Security Alerts</p>
          <h2 className="text-2xl font-bold mt-1">{alerts.length} alerts need a look.</h2>
        </div>
        <button
          onClick={simulateAttack}
          className="bg-red text-bg text-sm font-semibold px-4 py-2 rounded-md hover:bg-red/90 transition"
        >
          Simulate Attack
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
          const color = a.risk === 'high' ? 'red' : 'amber';
          return (
            <div key={a.id} className="bg-surface border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <span className={`w-2.5 h-2.5 rounded-full bg-${color} pulse-dot shrink-0`} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{a.title}</p>
                    <span className={`font-mono text-[10px] uppercase bg-${color}/15 text-${color} px-1.5 py-0.5 rounded`}>
                      {a.risk} risk
                    </span>
                  </div>
                  <p className="text-xs text-dim mt-1">{a.detail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs text-dim">{a.meta}</span>
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
