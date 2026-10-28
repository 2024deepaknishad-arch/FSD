// Centralized API configuration for CyberAudit 360 (Experiment 10)
// Supports VITE_API_URL (EXP 10 requirement) with fallback to VITE_API_BASE_URL and localhost:5000

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000';

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  API_BASE_URL;

export default {
  API_BASE_URL,
  SOCKET_URL,
};
