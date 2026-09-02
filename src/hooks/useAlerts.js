import { useContext } from 'react';
import { AlertsContext } from '../context/AlertsContext';

// Reusable hook: all consumers share one refreshed security-alert state.
export function useAlerts() {
  const context = useContext(AlertsContext);
  if (!context) throw new Error('useAlerts must be used within an AlertsProvider');
  return context;
}
