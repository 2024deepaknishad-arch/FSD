import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { API_BASE_URL } from '../config';

const MOCK_ALERTS = [
  { id: 'ALT-1', risk: 'high', severity: 'high', type: 'Authentication Anomaly', title: 'Possible brute-force attack', meta: '10:51:19', timestamp: '10:51:19', detail: '5 failed login attempts on account "unknown" within 5 minutes.', message: '5 failed login attempts on account "unknown" within 5 minutes.', resolved: false },
  { id: 'ALT-2', risk: 'medium', severity: 'medium', type: 'Access Window Anomaly', title: 'Unusual database access window', meta: '02:14:07', timestamp: '02:14:07', detail: 'Database accessed at 02:14 — outside the configured review window.', message: 'Database accessed at 02:14 — outside the configured review window.', resolved: false },
  { id: 'ALT-3', risk: 'medium', severity: 'medium', type: 'Data Deletion Anomaly', title: 'Rapid mass deletion', meta: 'earlier today', timestamp: '09:30:12', detail: 'Rahul deleted 3 invoice records within 90 seconds.', message: 'Rahul deleted 3 invoice records within 90 seconds.', resolved: false },
];


async function apiFetchAlerts() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/alerts`);
    if (!res.ok) throw new Error('API alerts fetch failed');
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : MOCK_ALERTS;
  } catch {
    return MOCK_ALERTS;
  }
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
  const token = localStorage.getItem('cyberaudit_token') || localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api/auditlogs`, {
    method: 'POST',
    headers,
    body: JSON.stringify(log),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Unable to create audit log.');
  return formatAuditLog(data);
}

const SecurityContext = createContext(null);

// Shared global security state: alerts, audit-logs, Socket.IO real-time event integration
export function SecurityProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [latestAlert, setLatestAlert] = useState(null);

  // Initial data loading from REST API
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

  // Experiment 8: Integrate shared Socket.IO connection for real-time security alerts
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    // Incoming real-time security alert emitted by the backend
    const handleSecurityAlert = (incomingAlert) => {
      console.log('[SecurityContext] Live securityAlert received over Socket.IO:', incomingAlert);
      if (!incomingAlert) return;

      const formatted = {
        id: incomingAlert.id || `ALT-${Date.now()}`,
        risk: incomingAlert.risk || incomingAlert.severity || 'high',
        severity: incomingAlert.severity || incomingAlert.risk || 'high',
        type: incomingAlert.type || 'Security Alert',
        title: incomingAlert.title || incomingAlert.type || 'Security Anomaly Detected',
        detail: incomingAlert.detail || incomingAlert.message || 'Suspicious event logged by backend sensor.',
        message: incomingAlert.message || incomingAlert.detail || 'Suspicious event logged by backend sensor.',
        meta: incomingAlert.meta || incomingAlert.timestamp || new Date().toLocaleTimeString('en-GB', { hour12: false }),
        timestamp: incomingAlert.timestamp || new Date().toLocaleTimeString('en-GB', { hour12: false }),
        resolved: false,
        ...incomingAlert,
      };

      setAlerts((prev) => {
        // Prevent duplicate alerts with same ID
        if (prev.some((a) => String(a.id) === String(formatted.id))) {
          return prev;
        }
        return [formatted, ...prev];
      });

      setLatestAlert(formatted);
    };

    // Incoming alert resolution event from backend/other tabs
    const handleAlertResolved = ({ id }) => {
      setAlerts((prev) =>
        prev.map((a) => (String(a.id) === String(id) ? { ...a, resolved: true } : a))
      );
    };

    if (socket.connected) {
      setSocketConnected(true);
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('securityAlert', handleSecurityAlert);
    socket.on('alertResolved', handleAlertResolved);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('securityAlert', handleSecurityAlert);
      socket.off('alertResolved', handleAlertResolved);
    };
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

  // Action 2: add an alert locally (preserved from Exp 3)
  const addAlert = useCallback((alert) => {
    const formatted = {
      id: alert.id || `ALT-${Date.now()}`,
      risk: alert.risk || alert.severity || 'high',
      severity: alert.severity || alert.risk || 'high',
      type: alert.type || 'Security Alert',
      title: alert.title || alert.type || 'Security Alert',
      detail: alert.detail || alert.message || 'Suspicious event detected',
      message: alert.message || alert.detail || 'Suspicious event detected',
      meta: alert.meta || alert.timestamp || 'just now',
      timestamp: alert.timestamp || new Date().toLocaleTimeString('en-GB', { hour12: false }),
      resolved: false,
      ...alert,
    };
    setAlerts((prev) => [formatted, ...prev]);
    setLatestAlert(formatted);
  }, []);

  // Action 3: resolve/dismiss an existing alert both locally and on backend
  const resolveAlert = useCallback(async (id) => {
    setAlerts((prev) => prev.map((a) => (String(a.id) === String(id) ? { ...a, resolved: true } : a)));
    try {
      await fetch(`${API_BASE_URL}/api/alerts/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      // Graceful fallback for offline mode
    }
  }, []);

  // Action 4: simulate security alert via backend REST API & Socket.IO broadcast
  const simulateSecurityAlert = useCallback(async (customPayload = {}) => {
    const token = localStorage.getItem('cyberaudit_token') || localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const body = {
      severity: 'high',
      risk: 'high',
      type: 'Suspicious Activity',
      title: 'Multiple Failed Login Attempts',
      message: '5 rapid failed login attempts flagged by IDS sensor on cluster #3.',
      ...customPayload,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/alerts/simulate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error('Server simulation endpoint error');
      }

      const data = await res.json();
      return data.alert;
    } catch (err) {
      console.warn('[SecurityContext] Fallback local alert trigger:', err.message);
      // Fallback local simulation if backend unavailable
      const fallbackAlert = {
        id: `ALT-${Date.now()}`,
        ...body,
      };
      addAlert(fallbackAlert);
      return fallbackAlert;
    }
  }, [addAlert]);

  const dismissLatestAlert = useCallback(() => {
    setLatestAlert(null);
  }, []);

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const highRiskCount = activeAlerts.filter((a) => (a.risk || a.severity) === 'high').length;
  const mediumRiskCount = activeAlerts.filter((a) => (a.risk || a.severity) === 'medium').length;
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
    socketConnected,
    latestAlert,
    dismissLatestAlert,
    addAuditLog,
    addAlert,
    resolveAlert,
    simulateSecurityAlert,
  };

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
}

export function useSecurity() {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error('useSecurity must be used within a SecurityProvider');
  return ctx;
}
