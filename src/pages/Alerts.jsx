import Layout from '../components/Layout';
import { StatCard } from '../components/Navbar';

const ALERTS = [
  ['red', 'high', 'Possible brute-force attack', '10:51:19', '5 failed login attempts on account "unknown" within 5 minutes.'],
  ['amber', 'medium', 'Unusual database access window', '02:14:07', 'Database accessed at 02:14 — outside the configured review window.'],
  ['amber', 'medium', 'Rapid mass deletion', 'earlier today', 'Rahul deleted 3 invoice records within 90 seconds.'],
];

export default function Alerts() {
  return (
    <Layout title="Security Alerts">
      <div>
        <p className="text-dim text-sm">Security Alerts</p>
        <h2 className="text-2xl font-bold mt-1">3 alerts need a look.</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <StatCard label="High Risk" value="1" valueClass="text-red" />
        <StatCard label="Medium Risk" value="2" valueClass="text-amber" />
      </div>

      <div className="space-y-3">
        {ALERTS.map(([color, risk, title, meta, detail]) => (
          <div key={title} className="bg-surface border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <span className={`w-2.5 h-2.5 rounded-full bg-${color} shrink-0`} />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{title}</p>
                  <span className={`font-mono text-[10px] uppercase bg-${color}/15 text-${color} px-1.5 py-0.5 rounded`}>{risk} risk</span>
                </div>
                <p className="text-xs text-dim mt-1">{detail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-mono text-xs text-dim">{meta}</span>
              <button className="text-xs border border-border rounded-md px-3 py-1.5 text-dim hover:text-text hover:border-cyan/40 transition">
                Investigate
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
