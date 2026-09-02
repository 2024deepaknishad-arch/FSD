import { useState, useEffect, useCallback } from 'react';

const MOCK_BACKUPS = [
  { id: 1, date: '18 Aug 2026', time: '18:30', size: '42.1 MB', status: 'Healthy' },
  { id: 2, date: '17 Aug 2026', time: '18:30', size: '41.8 MB', status: 'Healthy' },
  { id: 3, date: '16 Aug 2026', time: '18:30', size: '41.2 MB', status: 'Healthy' },
];

// Simulated GET /api/backups
function apiFetchBackups() {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_BACKUPS), 500));
}

// Simulated POST /api/backups
function apiCreateBackup() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date();
      resolve({
        id: Date.now(),
        date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        size: '42.4 MB',
        status: 'Healthy',
      });
    }, 700);
  });
}

// Simulated POST /api/backups/:id/restore
function apiRestoreBackup(id) {
  return new Promise((resolve) => setTimeout(() => resolve({ id, restored: true }), 700));
}

// Reusable hook: backups list plus createBackup() / restoreBackup() actions.
export function useBackups() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetchBackups().then(setBackups).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const createBackup = useCallback(async () => {
    setWorking(true);
    setError(null);
    try {
      const newBackup = await apiCreateBackup();
      setBackups((prev) => [newBackup, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  }, []);

  const restoreBackup = useCallback(async (id) => {
    setWorking(true);
    setError(null);
    try {
      await apiRestoreBackup(id);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setWorking(false);
    }
  }, []);

  return { backups, loading, working, error, createBackup, restoreBackup };
}
