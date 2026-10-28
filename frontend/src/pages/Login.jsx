import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login, register, loading, error: authError } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [localError, setLocalError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setLocalError(null);
    setFeedback(null);
    const ok = await login(email, password);
    if (ok) {
      navigate('/dashboard');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLocalError(null);
    setFeedback(null);

    if (!name || !email || !password) {
      setLocalError('Please fill in name, email, and password');
      return;
    }

    const res = await register(name, email, password);
    if (res.success) {
      setFeedback('Registration successful! Logging you in with your new account...');
      // Automatic login with newly created credentials
      const ok = await login(email, password);
      if (ok) {
        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        setMode('login');
      }
    } else {
      setLocalError(res.error || 'Registration failed');
    }
  }

  function fillCredentials(fillEmail, fillPass) {
    setEmail(fillEmail);
    setPassword(fillPass);
    setLocalError(null);
  }

  const displayedError = localError || authError;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 shadow-2xl">
        {/* Brand header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan pulse-dot" />
          <span className="font-mono font-semibold text-sm">
            CYBERAUDIT<span className="text-cyan">360</span>
          </span>
          <span className="ml-auto font-mono text-[10px] bg-cyan/10 text-cyan px-2 py-0.5 rounded border border-cyan/30">
            EXP 6 AUTH &amp; RBAC
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-surface2 p-1 rounded-lg border border-border mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLocalError(null);
              setFeedback(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
              mode === 'login' ? 'bg-cyan text-bg font-semibold' : 'text-dim hover:text-text'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setLocalError(null);
              setFeedback(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${
              mode === 'register' ? 'bg-cyan text-bg font-semibold' : 'text-dim hover:text-text'
            }`}
          >
            Register (New User)
          </button>
        </div>

        <h1 className="text-xl font-bold mb-1">
          {mode === 'login' ? 'Sign in to CyberAudit 360' : 'Create an Account'}
        </h1>
        <p className="text-xs text-dim mb-6">
          {mode === 'login'
            ? 'Access protected audit pipelines with verified JWT authentication.'
            : 'Register a new user in MongoDB Atlas (role assigned: "user").'}
        </p>

        {mode === 'login' ? (
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@cyberaudit.com"
                className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-cyan/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-cyan/50"
              />
            </div>

            {/* Quick Fill Helpers for Experiment 6 demonstration */}
            <div className="pt-1 border-t border-border/50">
              <p className="text-[11px] text-dim mb-1.5">Quick fill test accounts:</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('rahul@cyberaudit.com', 'Rahul@12345')}
                  className="text-[11px] bg-surface2 hover:border-cyan/40 border border-border px-2.5 py-1 rounded text-cyan font-mono"
                >
                  Rahul (User)
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('admin@cyberaudit.com', 'Admin@12345')}
                  className="text-[11px] bg-surface2 hover:border-amber/40 border border-border px-2.5 py-1 rounded text-amber font-mono"
                >
                  Admin (Admin)
                </button>
              </div>
            </div>

            {displayedError && <p className="text-xs text-red mt-2">{displayedError}</p>}
            {feedback && <p className="text-xs text-green mt-2">{feedback}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan text-bg font-semibold py-2.5 rounded-md hover:bg-cyan/90 transition disabled:opacity-60 text-sm mt-3"
            >
              {loading ? 'Authenticating…' : 'Sign In with JWT'}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-cyan/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@cyberaudit.com"
                className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-cyan/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">Password (min 6 chars)</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Rahul@12345"
                className="w-full bg-surface2 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-cyan/50"
              />
            </div>

            <div className="bg-surface2/50 border border-border rounded p-2.5 text-[11px] text-dim">
              <span className="text-cyan font-mono font-medium">RBAC Security Note:</span> All public registrations automatically assign the safe role <code className="text-text">"user"</code>. Passwords hashed via bcrypt.
            </div>

            {displayedError && <p className="text-xs text-red mt-2">{displayedError}</p>}
            {feedback && <p className="text-xs text-green mt-2">{feedback}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan text-bg font-semibold py-2.5 rounded-md hover:bg-cyan/90 transition disabled:opacity-60 text-sm mt-3"
            >
              {loading ? 'Creating Account…' : 'Register in Atlas'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
