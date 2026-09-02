import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuditLogs } from '../hooks/useAuditLogs';

const FILTERS = ['All', 'Success', 'Failed'];

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const { logs, loading, error, refreshLogs } = useAuditLogs({ search, status });

  return (
    <Layout title="Audit Logs">
      <div>
        <p className="text-dim text-sm">Audit Logs</p>
        <h2 className="text-2xl font-bold mt-1">Every recorded action, in order.</h2>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatus(f)}
                className={`text-xs rounded-full px-3 py-1 border transition ${
                  status === f ? 'bg-cyan/10 text-cyan border-cyan/30 font-medium' : 'text-dim border-border hover:text-text'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, action, resource…"
            className="bg-surface2 border border-border rounded-md px-3 py-1.5 text-xs w-56 focus:outline-none focus:border-cyan/50"
          />
        </div>

        {error && <div className="px-5 py-3 text-xs text-red border-b border-border">Could not load audit logs. <button onClick={refreshLogs} className="underline">Try again</button></div>}

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-dim border-b border-border">
              <th className="px-5 py-3 font-medium">Time</th>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Action</th>
              <th className="px-5 py-3 font-medium">Resource</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-dim text-xs">Loading logs…</td></tr>
            )}
            {!loading && logs.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-dim text-xs">No matching logs.</td></tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className={log.status === 'Failed' ? 'hover:bg-red/5' : 'hover:bg-surface2/60'}>
                <td className="px-5 py-3 font-mono text-xs text-dim">{log.time}</td>
                <td className="px-5 py-3">{log.user}</td>
                <td className="px-5 py-3 font-mono text-xs text-cyan">{log.action}</td>
                <td className="px-5 py-3 text-dim">{log.resource}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs ${log.status === 'Success' ? 'text-green' : 'text-red'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'Success' ? 'bg-green' : 'bg-red'}`} />
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
