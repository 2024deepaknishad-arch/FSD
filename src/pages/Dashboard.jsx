import Layout from '../components/Layout';
import { StatCard } from '../components/Navbar';

export default function Dashboard() {
  return (
    <Layout title="Security Overview">
      <div>
        <p className="text-dim text-sm">Good evening, Admin</p>
        <h2 className="text-2xl font-bold mt-1">Here's what's happening across your organization.</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Logs" value="1,284" hint="↑ 4.2% today" hintClass="text-green" />
        <StatCard label="Suspicious Activities" value="17" valueClass="text-amber" />
        <StatCard label="Failed Logins" value="4" valueClass="text-red" hint="1 flagged brute-force" hintClass="text-red" />
        <StatCard label="Last Backup" value="18:30" valueClass="text-cyan" hint="✓ Healthy" hintClass="text-green" />
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="font-semibold text-sm mb-4">Recent Security Events</h3>
        <ul className="space-y-4 text-sm">
          {[
            ['red', 'Multiple failed login attempts', '10:51:19'],
            ['amber', 'Unusual database access', '02:14:07'],
            ['green', 'Backup completed successfully', '18:30:00'],
            ['green', 'User login successful', '10:42:03'],
          ].map(([color, title, time]) => (
            <li key={title} className="flex gap-3">
              <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 bg-${color}`} />
              <div>
                <p className="leading-snug">{title}</p>
                <p className="text-xs text-dim font-mono">{time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
