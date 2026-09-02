import { useState } from 'react';
import Layout from '../components/Layout';
import { useUsers } from '../hooks/useUsers';

const roleColor = { Admin: 'cyan', 'Security Analyst': 'amber', Employee: 'dim' };

export default function Users() {
  const { users, loading, submitting, error, inviteUser } = useUsers();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Employee' });

  async function handleInvite(e) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    await inviteUser(form);
    setForm({ name: '', email: '', role: 'Employee' });
    setShowForm(false);
  }

  return (
    <Layout title="Users & Roles">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-dim text-sm">Users &amp; Roles</p>
          <h2 className="text-2xl font-bold mt-1">{users.length} members across 3 roles.</h2>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-cyan text-bg text-sm font-semibold px-4 py-2 rounded-md hover:bg-cyan/90 transition"
        >
          {showForm ? 'Cancel' : 'Invite user'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleInvite} className="bg-surface border border-border rounded-lg p-5 grid sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-1">
            <label className="block text-xs text-dim mb-1.5">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-cyan/50" />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs text-dim mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-cyan/50" />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs text-dim mb-1.5">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-cyan/50">
              <option>Employee</option>
              <option>Security Analyst</option>
              <option>Admin</option>
            </select>
          </div>
          <button type="submit" disabled={submitting}
            className="bg-cyan text-bg text-sm font-semibold px-4 py-2 rounded-md hover:bg-cyan/90 transition disabled:opacity-60">
            {submitting ? 'Sending…' : 'Send invite'}
          </button>
        </form>
      )}

      {error && <p className="text-xs text-red">{error}</p>}

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
            {loading && <tr><td colSpan={4} className="px-5 py-6 text-center text-dim text-xs">Loading users…</td></tr>}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-surface2/60 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-cyan/20 text-cyan flex items-center justify-center text-[10px] font-semibold">{u.initials}</div>
                    <span>{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-dim">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`font-mono text-[10px] uppercase bg-${roleColor[u.role]}/15 text-${roleColor[u.role]} px-1.5 py-0.5 rounded`}>{u.role}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs ${u.status === 'Active' ? 'text-green' : 'text-amber'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-green' : 'bg-amber'}`} />
                    {u.status}
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
