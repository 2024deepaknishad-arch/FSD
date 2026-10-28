import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function DockerStatus() {
  const [message, setMessage] = useState('Connecting to backend...');
  const [statusOk, setStatusOk] = useState(null);
  const [auditLogCount, setAuditLogCount] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkBackend = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api`)
      .then((response) => {
        if (!response.ok) throw new Error('Bad response');
        return response.json();
      })
      .then((data) => {
        setMessage(data.message || 'Backend is running inside Docker!');
        setStatusOk(true);
      })
      .catch(() => {
        setMessage('Backend connection failed');
        setStatusOk(false);
      })
      .finally(() => setLoading(false));

    // Also test audit logs endpoint to verify DB and API CRUD
    fetch(`${API_BASE_URL}/api/auditlogs`)
      .then((res) => (res.ok ? res.json() : []))
      .then((logs) => setAuditLogCount(Array.isArray(logs) ? logs.length : 0))
      .catch(() => setAuditLogCount(null));
  };

  useEffect(() => {
    checkBackend();
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text font-sans flex flex-col justify-between p-6">
      <div className="max-w-2xl mx-auto w-full pt-16">
        {/* Lab Specification Reference Card */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan/10 text-cyan mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text mb-2">
            Full Stack Docker Application
          </h1>
          <p className="text-dim text-sm">
            Frontend: <span className="text-cyan font-mono font-semibold">React</span>
          </p>
        </div>

        {/* Experiment 7 Primary Response Display */}
        <div className="bg-surface border border-border rounded-xl p-8 shadow-xl text-center mb-8">
          <p className="text-xs uppercase tracking-wider font-mono text-dim mb-3">Backend Response</p>
          <div
            className={`inline-block px-6 py-3 rounded-lg text-lg font-mono font-medium transition ${
              statusOk === true
                ? 'bg-green/15 text-green border border-green/30'
                : statusOk === false
                ? 'bg-red/15 text-red border border-red/30'
                : 'bg-surface2 text-dim border border-border'
            }`}
          >
            {loading ? 'Connecting to backend…' : message}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={checkBackend}
              className="text-xs font-mono bg-cyan text-bg px-4 py-2 rounded-md hover:bg-cyan/90 transition"
            >
              Re-test Backend Connection
            </button>
            <a
              href={`${API_BASE_URL}/api`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono border border-border text-dim hover:text-text px-4 py-2 rounded-md transition"
            >
              Open API JSON Directly (port 5000)
            </a>
          </div>
        </div>

        {/* DevOps & Diagnostics Breakdown */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-8">
          <h3 className="text-sm font-semibold mb-4 text-text flex items-center justify-between">
            <span>Experiment 9 Docker Compose Diagnostics</span>
            <span className="font-mono text-xs text-dim">CyberAudit 360</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-surface2 rounded-md border border-border">
              <span className="text-dim block mb-1">Frontend Service</span>
              <span className="text-cyan font-semibold">React + Vite Dev Container</span>
              <div className="text-dim mt-1">Container Port: 5173 → Host: 5173</div>
            </div>

            <div className="p-3 bg-surface2 rounded-md border border-border">
              <span className="text-dim block mb-1">Backend Service</span>
              <span className="text-cyan font-semibold">Node.js / Express + Socket.IO</span>
              <div className="text-dim mt-1">Container Port: 5000 → Host: 5000</div>
            </div>

            <div className="p-3 bg-surface2 rounded-md border border-border">
              <span className="text-dim block mb-1">Database Layer</span>
              <span className="text-green font-semibold">MongoDB Atlas (Cloud)</span>
              <div className="text-dim mt-1">Direct Secure Connection via Mongoose</div>
            </div>

            <div className="p-3 bg-surface2 rounded-md border border-border">
              <span className="text-dim block mb-1">AuditLog API Status</span>
              <span className={auditLogCount !== null ? 'text-green font-semibold' : 'text-amber'}>
                {auditLogCount !== null ? `${auditLogCount} Logs Recorded in Atlas` : 'Querying…'}
              </span>
              <div className="text-dim mt-1">Endpoint: /api/auditlogs</div>
            </div>
          </div>
        </div>

        {/* Back navigation */}
        <div className="text-center flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link to="/" className="text-dim hover:text-cyan transition">
            ← Back to Platform Landing
          </Link>
          <span className="text-border">|</span>
          <Link to="/chat" className="text-dim hover:text-cyan transition">
            💬 Real-Time Chat (Exp 8)
          </Link>
          <span className="text-border">|</span>
          <Link to="/login" className="text-dim hover:text-cyan transition">
            Login to CyberAudit 360 →
          </Link>
        </div>
      </div>

      <footer className="text-center text-xs text-dim py-6 border-t border-border mt-12 font-mono">
        CyberAudit 360 • Experiment 9: Multi-Container Architecture with Docker Compose
      </footer>
    </div>
  );
}
