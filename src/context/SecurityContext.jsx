import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const MOCK_ALERTS = [
  { id: 1, risk: 'high', title: 'Possible brute-force attack', meta: '10:51:19', detail: '5 failed login attempts on account "unknown" within 5 minutes.', resolved: false },
  { id: 2, risk: 'medium', title: 'Unusual database access window', meta: '02:14:07', detail: 'Database accessed at 02:14 — outside the configured review window.', resolved: false },
  { id: 3, risk: 'medium', title: 'Rapid mass deletion', meta: 'earlier today', detail: 'Rahul deleted 3 invoice records within 90 seconds.', resolved: false },
];

// Simulated GET /api/alerts (Experiment 4 swaps this for a real fetch)
function apiFetchAlerts() {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_ALERTS), 500));
}

const SecurityContext = createContext(null);

// This is the SINGLE global state for the whole app: every component that calls
// useSecurity() reads/writes the same `alerts` array — no prop-drilling needed.
export function SecurityProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchAlerts().then(setAlerts).finally(() => setLoading(false));
  }, []);

  // Action 1: add a new alert (e.g. the security engine detects something suspicious)
  const addAlert = useCallback((alert) => {
    setAlerts((prev) => [
      { id: Date.now(), resolved: false, meta: 'just now', ...alert },
      ...prev,
    ]);
  }, []);

  // Action 2: resolve/dismiss an existing alert
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
    highRiskCount,
    mediumRiskCount,
    securityScore,
    loading,
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
