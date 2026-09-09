import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-surface border border-border rounded-xl p-8 shadow-2xl">
        <h1 className="text-xl font-bold mb-1">Sign in to your console</h1>
        <p className="text-sm text-dim mb-8">Monitor activity across your organization.</p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full bg-surface2 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-cyan/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface2 border border-border rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-cyan/50"
            />
          </div>

          {error && <p className="text-xs text-red">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan text-bg font-semibold py-2.5 rounded-md hover:bg-cyan/90 transition disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}
