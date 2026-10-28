import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { StatCard } from '../components/Navbar';
import { getSocket } from '../services/socket';
import { useAuth } from '../hooks/useAuth';
import { useSecurity } from '../context/SecurityContext';

export default function RealTimeChat() {
  const { user } = useAuth();
  const { simulateSecurityAlert, latestAlert, dismissLatestAlert } = useSecurity();

  // Username: prefill with authenticated user name, but allow custom display name (e.g. Student 1 / Student 2)
  const [username, setUsername] = useState(user?.name || 'Student 1');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      username: 'System',
      message: 'Real-time WebSocket communication channel initialized via Socket.IO.',
      timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      isSystem: true,
    },
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState('');
  const [alertTriggering, setAlertTriggering] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to latest chat message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Shared Socket.IO lifecycle and event listener management
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setIsConnected(true);
      setSocketId(socket.id || '');
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setSocketId('');
    };

    const onChatMessage = (incomingMsg) => {
      if (!incomingMsg || !incomingMsg.message) return;
      setMessages((prev) => [...prev, incomingMsg]);
    };

    // Update connection status immediately if socket is already open
    if (socket.connected) {
      setIsConnected(true);
      setSocketId(socket.id || '');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('chatMessage', onChatMessage);

    // Clean up listeners on unmount to prevent memory leaks and duplicate events
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('chatMessage', onChatMessage);
    };
  }, []);

  // Send message over shared Socket.IO connection
  const handleSendMessage = (e) => {
    e.preventDefault();

    const trimmedMsg = message.trim();
    const trimmedUser = username.trim() || 'Anonymous';

    // Test 6: Validate and reject empty or whitespace-only messages
    if (!trimmedMsg) {
      return;
    }

    const socket = getSocket();
    if (!socket || !socket.connected) {
      alert('Socket.IO is disconnected. Please check backend connection.');
      return;
    }

    // Emit chatMessage to backend (which broadcasts to all connected clients)
    socket.emit('chatMessage', {
      username: trimmedUser,
      message: trimmedMsg,
    });

    // Clear input field
    setMessage('');
  };

  // Test trigger for live security alert broadcast across tabs
  const handleTriggerSecurityAlert = async () => {
    try {
      setAlertTriggering(true);
      await simulateSecurityAlert({
        title: 'Real-Time Intrusion Alert',
        message: `High-frequency unauthorized queries detected on database port 27017 by ${username}.`,
        severity: 'high',
        type: 'Database Threat Detected',
      });
    } catch (err) {
      console.error('Failed to trigger security alert:', err);
    } finally {
      setAlertTriggering(false);
    }
  };

  return (
    <Layout
      title="Real-Time Communication"
      statusText={isConnected ? 'Socket.IO: Connected' : 'Socket.IO: Disconnected'}
      statusColor={isConnected ? 'green' : 'red'}
    >
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green pulse-dot' : 'bg-red'
              }`}
            />
            <h2 className="text-2xl font-bold">Real-Time Communication</h2>
          </div>
          <p className="text-dim text-sm mt-1">
            Experiment 8 — Full-Duplex WebSockets with Socket.IO (Broadcast Chat & Security Alert Bus)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerSecurityAlert}
            disabled={alertTriggering || !isConnected}
            className="px-3.5 py-2 text-xs font-semibold bg-red text-bg rounded-md hover:bg-red/90 transition disabled:opacity-50 flex items-center gap-2"
            title="Broadcast a live security alert to all connected tabs"
          >
            <span className="w-2 h-2 rounded-full bg-bg" />
            {alertTriggering ? 'Broadcasting...' : 'Trigger Live Security Alert'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Connection Status"
          value={isConnected ? 'Connected' : 'Disconnected'}
          valueClass={isConnected ? 'text-green' : 'text-red'}
          hint={isConnected ? `Socket ID: ${socketId ? socketId.slice(0, 8) + '...' : 'Active'}` : 'Reconnecting...'}
          hintClass={isConnected ? 'text-green' : 'text-red'}
        />
        <StatCard
          label="Messages Received"
          value={messages.length}
          valueClass="text-cyan"
          hint="In-memory real-time stream"
        />
        <StatCard
          label="Active Protocol"
          value="WebSocket"
          valueClass="text-purple-400"
          hint="Socket.IO v4 Engine"
        />
        <StatCard
          label="Active Display Name"
          value={username || 'Anonymous'}
          valueClass="text-amber"
          hint="Configurable for multi-tab testing"
        />
      </div>

      {/* Live Security Alert Notification Banner (when event received) */}
      {latestAlert && (
        <div className="bg-red/10 border border-red/40 rounded-lg p-4 flex items-start justify-between gap-4 animate-pulse">
          <div className="flex items-start gap-3">
            <span className="w-2.5 h-2.5 mt-1 rounded-full bg-red shrink-0 pulse-dot" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs uppercase bg-red/20 text-red px-2 py-0.5 rounded font-bold">
                  LIVE SECURITY ALERT
                </span>
                <span className="text-xs text-dim font-mono">{latestAlert.timestamp || latestAlert.meta}</span>
              </div>
              <p className="font-semibold text-sm mt-1 text-red">{latestAlert.title}</p>
              <p className="text-xs text-dim mt-0.5">{latestAlert.detail || latestAlert.message}</p>
            </div>
          </div>
          <button
            onClick={dismissLatestAlert}
            className="text-xs text-dim hover:text-text px-2 py-1 rounded bg-surface border border-border"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="bg-surface border border-border rounded-lg flex flex-col h-[520px] overflow-hidden shadow-sm">
        {/* Chat Header Bar */}
        <div className="h-14 border-b border-border px-5 flex items-center justify-between bg-surface2/50">
          <div className="flex items-center gap-3">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green' : 'bg-red'
              }`}
            />
            <span className="text-xs font-mono font-semibold tracking-wide uppercase text-dim">
              Status: <span className={isConnected ? 'text-green font-bold' : 'text-red font-bold'}>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </span>
          </div>

          {/* Username Input Field */}
          <div className="flex items-center gap-2">
            <label htmlFor="username-input" className="text-xs text-dim font-mono">
              Username:
            </label>
            <input
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter name (e.g. Student 1)"
              className="bg-bg border border-border rounded px-2.5 py-1 text-xs text-text focus:outline-none focus:border-cyan w-36 font-medium"
              maxLength={40}
            />
          </div>
        </div>

        {/* Message History Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 font-sans">
          {messages.map((msg, index) => {
            const isSelf = msg.username === username;
            const isSys = msg.isSystem || msg.username === 'System';

            if (isSys) {
              return (
                <div key={msg.id || index} className="flex justify-center my-2">
                  <div className="bg-surface2/70 border border-border rounded-full px-4 py-1 text-[11px] font-mono text-dim flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
                    <span>{msg.message}</span>
                    <span className="opacity-60">{msg.timestamp}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id || index}
                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span
                    className={`text-xs font-semibold ${
                      isSelf ? 'text-cyan' : 'text-amber'
                    }`}
                  >
                    {msg.username}
                  </span>
                  <span className="text-[10px] text-dim font-mono">
                    {msg.timestamp}
                  </span>
                </div>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-lg text-sm break-words border ${
                    isSelf
                      ? 'bg-cyan/15 text-text border-cyan/30 rounded-tr-none'
                      : 'bg-surface2 text-text border-border rounded-tl-none'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input & Send Form */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-border p-3.5 bg-surface2/30 flex items-center gap-3"
        >
          <input
            id="chat-message-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isConnected
                ? 'Type a message... (Press Enter to Send)'
                : 'Connecting to WebSocket server...'
            }
            disabled={!isConnected}
            maxLength={500}
            className="flex-1 bg-bg border border-border rounded-md px-4 py-2.5 text-sm text-text placeholder-dim focus:outline-none focus:border-cyan disabled:opacity-50"
          />
          <button
            id="chat-send-btn"
            type="submit"
            disabled={!isConnected || !message.trim()}
            className="bg-cyan text-bg font-semibold text-sm px-6 py-2.5 rounded-md hover:bg-cyan/90 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            Send
          </button>
        </form>
      </div>

      {/* Instructional helper for 2-tab verification */}
      <div className="bg-surface2/40 border border-border rounded-lg p-4 text-xs text-dim flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
        <div>
          <span className="text-cyan font-bold">Experiment 8 Multi-Tab Demonstration:</span> Open CyberAudit 360 in two separate browser tabs. Set Tab 1 username to "Student 1" and Tab 2 username to "Student 2". Messages appear instantly without refreshing!
        </div>
        <span className="px-2 py-0.5 rounded bg-surface text-cyan border border-border shrink-0">
          Socket.IO v4 • Port 5000
        </span>
      </div>
    </Layout>
  );
}
