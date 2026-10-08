import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MOCK_ALERTS = [
  { id: 1, risk: 'high', title: 'Possible brute-force attack', meta: '10:51:19', detail: '5 failed login attempts on account "unknown" within 5 minutes.', resolved: false },
  { id: 2, risk: 'medium', title: 'Unusual database access window', meta: '02:14:07', detail: 'Database accessed at 02:14 — outside the configured review window.', resolved: false },
  { id: 3, risk: 'medium', title: 'Rapid mass deletion', meta: 'earlier today', detail: 'Rahul deleted 3 invoice records within 90 seconds.', resolved: false },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Simulated GET /api/alerts (Experiment 4 swaps this for a real fetch)
function apiFetchAlerts() {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_ALERTS), 500));
}

function formatAuditLog(log) {
  return {
    ...log,
    id: log._id,
    time: log.createdAt
      ? new Date(log.createdAt).toLocaleTimeString('en-GB', { hour12: false })
      : '--:--:--',
  };
}

async function apiFetchAuditLogs() {
  const response = await fetch(`${API_BASE_URL}/api/auditlogs`);
  if (!response.ok) throw new Error('Unable to load audit logs from the API.');
  const logs = await response.json();
  return logs.map(formatAuditLog);
}

async function apiCreateAuditLog(log) {
  const response = await fetch(`${API_BASE_URL}/api/auditlogs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Unable to create audit log.');
  return formatAuditLog(data);
}

const SecurityContext = createContext(null);

// This is the shared global security state: consumers read/write the same alerts
// and audit-log arrays, so Dashboard, Audit Logs, Alerts, and Sidebar stay in sync.
export function SecurityProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetchAlerts()
      .then(setAlerts)
      .catch((err) => setError(err.message))
      .finally(() => setAlertsLoading(false));
    apiFetchAuditLogs()
      .then(setAuditLogs)
      .catch((err) => setError(err.message))
      .finally(() => setLogsLoading(false));
  }, []);

  // Action 1: persist a new audit event, then update the shared UI state.
  const addAuditLog = useCallback(async (log) => {
    try {
      setError(null);
      const createdLog = await apiCreateAuditLog(log);
      setAuditLogs((previous) => [createdLog, ...previous]);
      return createdLog;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Optional related action: the security engine can also add an alert.
  const addAlert = useCallback((alert) => {
    setAlerts((prev) => [
      { id: Date.now(), resolved: false, meta: 'just now', ...alert },
      ...prev,
    ]);
  }, []);

  // Action 2: resolve/dismiss an existing alert.
  const resolveAlert = useCallback((id) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
  }, []);

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const highRiskCount = activeAlerts.filter((a) => a.risk === 'high').length;
  const mediumRiskCount = activeAlerts.filter((a) => a.risk === 'medium').length;
  const securityScore = Math.max(40, 100 - highRiskCount * 15 - mediumRiskCount * 5);

  const value = {
    alerts: activeAlerts,
    allAlerts: alerts,
    auditLogs,
    highRiskCount,
    mediumRiskCount,
    securityScore,
    loading: alertsLoading || logsLoading,
    alertsLoading,
    logsLoading,
    error,
    addAuditLog,
    addAlert,
    resolveAlert,
  };

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
}

// useContext() access point — this replaces the old per-component fetch in useAlerts.
export function useSecurity() {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error('useSecurity must be used within a SecurityProvider');
  return ctx;
}
