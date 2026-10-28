import { io } from 'socket.io-client';

// Use configurable Socket URL, fallback to API base URL or localhost:5000
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000';

let socketInstance = null;

/**
 * Returns a shared Socket.IO client connection.
 * Guarantees a single persistent WebSocket connection across components.
 */
export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('[Socket.IO] Connected to backend server:', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected from backend server:', reason);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
    });
  }

  return socketInstance;
}

export default getSocket;
