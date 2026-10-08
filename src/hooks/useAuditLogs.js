import { useMemo } from 'react';
import { useSecurity } from '../context/SecurityContext';

// Reusable hook: any page that needs logs calls useAuditLogs(search, statusFilter).
export function useAuditLogs({ search = '', status = 'All' } = {}) {
  const { auditLogs, logsLoading, error, addAuditLog } = useSecurity();

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesStatus = status === 'All' || log.status === status;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.resource.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [auditLogs, search, status]);

  return { logs: filteredLogs, allLogs: auditLogs, loading: logsLoading, error, addAuditLog };
}
