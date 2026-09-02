import Layout from '../components/Layout';

const BACKUPS = [
  ['18 Aug 2026', '18:30', '42.1 MB'],
  ['17 Aug 2026', '18:30', '41.8 MB'],
  ['16 Aug 2026', '18:30', '41.2 MB'],
];

export default function Backups() {
  return (
    <Layout title="Backups & Recovery">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-dim text-sm">Backups &amp; Recovery</p>
          <h2 className="text-2xl font-bold mt-1">Last backup completed at 18:30.</h2>
        </div>
        <button className="bg-cyan text-bg text-sm font-semibold px-4 py-2 rounded-md hover:bg-cyan/90 transition">
          Create backup
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
            {BACKUPS.map(([date, time, size]) => (
              <tr key={date} className="hover:bg-surface2/60 transition">
                <td className="px-5 py-3 font-mono text-xs">{date}</td>
                <td className="px-5 py-3 font-mono text-xs text-dim">{time}</td>
                <td className="px-5 py-3 text-dim">{size}</td>
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-green">
                    <span className="w-1.5 h-1.5 rounded-full bg-green" /> Healthy
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="text-xs text-cyan hover:underline">Restore</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
