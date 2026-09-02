import { createContext, useCallback, useEffect, useState } from 'react';

export const AlertsContext = createContext(null);

const MOCK_ALERTS = [
  { id: 1, risk: 'high', title: 'Possible brute-force attack', meta: '10:51:19', detail: '5 failed login attempts on account "unknown" within 5 minutes.', resolved: false },
  { id: 2, risk: 'medium', title: 'Unusual database access window', meta: '02:14:07', detail: 'Database accessed at 02:14 — outside the configured review window.', resolved: false },
  { id: 3, risk: 'medium', title: 'Rapid mass deletion', meta: 'earlier today', detail: 'Rahul deleted 3 invoice records within 90 seconds.', resolved: false },
];

function apiFetchAlerts() {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_ALERTS), 500));
}

function apiResolveAlert(id) {
  return new Promise((resolve) => setTimeout(() => resolve({ id, resolved: true }), 300));
}

export function AlertsProvider({ children }) {
  const [allAlerts, setAllAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const alerts = await apiFetchAlerts();
      setAllAlerts(alerts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAlerts();
  }, [refreshAlerts]);

  const resolveAlert = useCallback(async (id) => {
    await apiResolveAlert(id);
    setAllAlerts((previous) => previous.map((alert) => (
      alert.id === id ? { ...alert, resolved: true } : alert
    )));
  }, []);

  const alerts = allAlerts.filter((alert) => !alert.resolved);
  const highRiskCount = alerts.filter((alert) => alert.risk === 'high').length;
  const mediumRiskCount = alerts.filter((alert) => alert.risk === 'medium').length;

  return (
    <AlertsContext.Provider value={{ alerts, allAlerts, highRiskCount, mediumRiskCount, loading, error, refreshAlerts, resolveAlert }}>
      {children}
    </AlertsContext.Provider>
  );
}
