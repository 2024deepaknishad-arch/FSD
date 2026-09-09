import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MOCK_ALERTS = [
  { id: 1, risk: 'high', title: 'Possible brute-force attack', meta: '10:51:19', detail: '5 failed login attempts on account "unknown" within 5 minutes.', resolved: false },
  { id: 2, risk: 'medium', title: 'Unusual database access window', meta: '02:14:07', detail: 'Database accessed at 02:14 — outside the configured review window.', resolved: false },
  { id: 3, risk: 'medium', title: 'Rapid mass deletion', meta: 'earlier today', detail: 'Rahul deleted 3 invoice records within 90 seconds.', resolved: false },
];

const MOCK_AUDIT_LOGS = [
  { id: 1, time: '10:42:03', user: 'Admin', action: 'LOGIN', resource: 'Authentication', status: 'Success' },
  { id: 2, time: '10:44:41', user: 'Rahul', action: 'UPDATE', resource: 'Customer #4471', status: 'Success' },
  { id: 3, time: '10:46:03', user: 'Rahul', action: 'DELETE', resource: 'Invoice #8825', status: 'Success' },
  { id: 4, time: '10:48:57', user: 'Admin', action: 'BACKUP', resource: 'Database', status: 'Success' },
  { id: 5, time: '10:51:19', user: 'Unknown', action: 'LOGIN', resource: 'Authentication', status: 'Failed' },
];

// Simulated GET /api/alerts (Experiment 4 swaps this for a real fetch)
function apiFetchAlerts() {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_ALERTS), 500));
}

function apiFetchAuditLogs() {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_AUDIT_LOGS), 500));
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

  // Action 1: add a new audit record from a meaningful security event.
  const addAuditLog = useCallback((log) => {
    setAuditLogs((previous) => [
      { id: Date.now(), time: new Date().toLocaleTimeString('en-GB', { hour12: false }), ...log },
      ...previous,
    ]);
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
