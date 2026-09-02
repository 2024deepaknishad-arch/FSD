import Layout from '../components/Layout';

const LOGS = [
  ['10:42:03', 'Admin', 'LOGIN', 'Authentication', 'Success'],
  ['10:44:41', 'Rahul', 'UPDATE', 'Customer #4471', 'Success'],
  ['10:46:03', 'Rahul', 'DELETE', 'Invoice #8825', 'Success'],
  ['10:48:57', 'Admin', 'BACKUP', 'Database', 'Success'],
  ['10:51:19', 'Unknown', 'LOGIN', 'Authentication', 'Failed'],
];

export default function AuditLogs() {
  return (
    <Layout title="Audit Logs">
      <div>
        <p className="text-dim text-sm">Audit Logs</p>
        <h2 className="text-2xl font-bold mt-1">Every recorded action, in order.</h2>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Success', 'Failed'].map((f) => (
              <button key={f} className={`text-xs rounded-full px-3 py-1 border ${f === 'All' ? 'bg-cyan/10 text-cyan border-cyan/30 font-medium' : 'text-dim border-border'}`}>
                {f}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by user, action, resource…"
            className="bg-surface2 border border-border rounded-md px-3 py-1.5 text-xs w-56 focus:outline-none focus:border-cyan/50"
          />
        </div>

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
            {LOGS.map(([time, user, action, resource, status]) => (
              <tr key={time} className={status === 'Failed' ? 'hover:bg-red/5' : 'hover:bg-surface2/60'}>
                <td className="px-5 py-3 font-mono text-xs text-dim">{time}</td>
                <td className="px-5 py-3">{user}</td>
                <td className="px-5 py-3 font-mono text-xs text-cyan">{action}</td>
                <td className="px-5 py-3 text-dim">{resource}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs ${status === 'Success' ? 'text-green' : 'text-red'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status === 'Success' ? 'bg-green' : 'bg-red'}`} />
                    {status}
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
