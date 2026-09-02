import { useState, useEffect, useMemo, useCallback } from 'react';

const MOCK_LOGS = [
  { id: 1, time: '10:42:03', user: 'Admin', action: 'LOGIN', resource: 'Authentication', status: 'Success' },
  { id: 2, time: '10:44:41', user: 'Rahul', action: 'UPDATE', resource: 'Customer #4471', status: 'Success' },
  { id: 3, time: '10:46:03', user: 'Rahul', action: 'DELETE', resource: 'Invoice #8825', status: 'Success' },
  { id: 4, time: '10:48:57', user: 'Admin', action: 'BACKUP', resource: 'Database', status: 'Success' },
  { id: 5, time: '10:51:19', user: 'Unknown', action: 'LOGIN', resource: 'Authentication', status: 'Failed' },
];

// Simulated GET /api/audit-logs. Real version: fetch(`/api/audit-logs`).then(r => r.json())
function apiFetchLogs() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_LOGS), 500);
  });
}

// Reusable hook: any page that needs logs calls useAuditLogs(search, statusFilter).
export function useAuditLogs({ search = '', status = 'All' } = {}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetchLogs();
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesStatus = status === 'All' || log.status === status;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.resource.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [logs, search, status]);

  return { logs: filteredLogs, allLogs: logs, loading, error, refreshLogs };
}
