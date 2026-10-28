import Layout from '../components/Layout';
import { useBackups } from '../hooks/useBackups';

export default function Backups() {
  const { backups, loading, working, createBackup, restoreBackup } = useBackups();

  return (
    <Layout title="Backups & Recovery">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-dim text-sm">Backups &amp; Recovery</p>
          <h2 className="text-2xl font-bold mt-1">
            {backups[0] ? `Last backup completed at ${backups[0].time}.` : 'No backups yet.'}
          </h2>
        </div>
        <button
          onClick={createBackup}
          disabled={working}
          className="bg-cyan text-bg text-sm font-semibold px-4 py-2 rounded-md hover:bg-cyan/90 transition disabled:opacity-60"
        >
          {working ? 'Working…' : 'Create backup'}
        </button>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-sm">Available backups</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-dim border-b border-border">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Time</th>
              <th className="px-5 py-3 font-medium">Size</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && <tr><td colSpan={5} className="px-5 py-6 text-center text-dim text-xs">Loading backups…</td></tr>}
            {backups.map((b) => (
              <tr key={b.id} className="hover:bg-surface2/60 transition">
                <td className="px-5 py-3 font-mono text-xs">{b.date}</td>
                <td className="px-5 py-3 font-mono text-xs text-dim">{b.time}</td>
                <td className="px-5 py-3 text-dim">{b.size}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-green">
                    <span className="w-1.5 h-1.5 rounded-full bg-green" /> {b.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => restoreBackup(b.id)}
                    disabled={working}
                    className="text-xs text-cyan hover:underline disabled:opacity-60"
                  >
                    Restore
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
