import Layout from '../components/Layout';

const USERS = [
  ['AD', 'Admin', 'admin@cyberaudit360.com', 'Admin', 'cyan', 'Active'],
  ['PS', 'Priya Sharma', 'priya@company.com', 'Security Analyst', 'amber', 'Active'],
  ['RK', 'Rahul Khanna', 'rahul@company.com', 'Employee', 'dim', 'Active'],
  ['MV', 'Meera Verma', 'meera@company.com', 'Employee', 'dim', 'Invited'],
];

export default function Users() {
  return (
    <Layout title="Users & Roles">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-dim text-sm">Users &amp; Roles</p>
          <h2 className="text-2xl font-bold mt-1">4 members across 3 roles.</h2>
        </div>
        <button className="bg-cyan text-bg text-sm font-semibold px-4 py-2 rounded-md hover:bg-cyan/90 transition">
          Invite user
        </button>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-dim border-b border-border">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {USERS.map(([initials, name, email, role, color, status]) => (
              <tr key={email} className="hover:bg-surface2/60 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-cyan/20 text-cyan flex items-center justify-center text-[10px] font-semibold">{initials}</div>
                    <span>{name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-dim">{email}</td>
                <td className="px-5 py-3">
                  <span className={`font-mono text-[10px] uppercase bg-${color}/15 text-${color} px-1.5 py-0.5 rounded`}>{role}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs ${status === 'Active' ? 'text-green' : 'text-amber'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-green' : 'bg-amber'}`} />
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
