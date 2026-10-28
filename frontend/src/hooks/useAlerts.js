// Experiment 2 gave us this hook as a per-component fetch.
// Experiment 3 upgrades it to read from the global SecurityContext instead —
// every page now shares the same alerts state (see src/context/SecurityContext.jsx).
export { useSecurity as useAlerts } from '../context/SecurityContext';
