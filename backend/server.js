const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const http = require('http');
const { Server } = require('socket.io');

// Ensure .env is reliably loaded from backend directory
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const auditLogRoutes = require('./routes/auditLogRoutes');
const userRoutes = require('./routes/userRoutes');
const alertRoutes = require('./routes/alertRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Allowed frontend origins for CORS (Vite dev, Docker frontend, localhost, Vercel & Render production)
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:80',
  'http://localhost',
];

const envAllowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const isOriginAllowed = (origin, callback) => {
  // Allow requests without origin (e.g. mobile apps, curl, Postman, server-to-server)
  if (!origin) {
    return callback(null, true);
  }

  // Check explicit default and env-configured origins
  if (defaultAllowedOrigins.includes(origin) || envAllowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  // Allow any deployed Vercel preview or production domain (*.vercel.app)
  if (/^https:\/\/[a-zA-Z0-9_.-]+\.vercel\.app$/.test(origin)) {
    return callback(null, true);
  }

  // Allow deployed Render domain (*.onrender.com)
  if (/^https:\/\/[a-zA-Z0-9_.-]+\.onrender\.com$/.test(origin)) {
    return callback(null, true);
  }

  // Block any unrecognized origin
  return callback(null, false);
};

// Configure Socket.IO server attached to the HTTP server
const io = new Server(server, {
  cors: {
    origin: isOriginAllowed,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Provide io instance to Express routes and middleware
app.set('io', io);

// Socket.IO Event Handlers (Experiment 8)
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Broadcast chatMessage event to all connected clients
  socket.on('chatMessage', (data) => {
    if (!data || typeof data !== 'object') {
      return;
    }

    const rawUsername = typeof data.username === 'string' ? data.username.trim() : '';
    const rawMessage = typeof data.message === 'string' ? data.message.trim() : '';

    // Test 6: Reject empty or whitespace-only messages
    if (!rawMessage) {
      return;
    }

    // Apply length limits: username max 50 chars, message max 500 chars
    const username = (rawUsername || 'Anonymous').slice(0, 50);
    const message = rawMessage.slice(0, 500);
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });

    const outgoingPayload = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      username,
      message,
      timestamp,
    };

    console.log(`[Socket.IO] chatMessage broadcast: "${username}" -> "${message}" (${timestamp})`);
    io.emit('chatMessage', outgoingPayload);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id} (Reason: ${reason})`);
  });
});

// Trust reverse proxy (Docker/Nginx)
app.set('trust proxy', 1);

// Security Middleware: Helmet HTTP headers
app.use(helmet());

// Security Middleware: Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: isOriginAllowed,
    credentials: true,
  })
);

// Body Parser Middleware
app.use(express.json());

// Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use(limiter);

// Health check / root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'CyberAudit 360 Secure REST API is Running',
    version: '1.0.0',
    status: 'Healthy',
  });
});

// Experiment 10: Health check endpoint for Render / cloud monitoring
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'Healthy',
    service: 'CyberAudit 360 API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Experiment 7 Docker API endpoint (as required by EXP NO.7)
app.get('/api', (_req, res) => {
  res.json({
    message: 'Backend is running inside Docker!',
    service: 'CyberAudit 360 API',
    status: 'Healthy',
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/auditlogs', auditLogRoutes);
app.use('/api/alerts', alertRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Attach server and io to app for compatibility
app.server = server;
app.io = io;

// MongoDB Atlas connection logic (Atlas only - no local fallback)
async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.error('MongoDB Connection Error: MONGO_URI is not set in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB Atlas Connected');
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
}

// Seed default administrator if not present in MongoDB Atlas (Experiment 6)
async function ensureAdminExists() {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@12345', salt);
      await User.create({
        name: 'System Administrator',
        email: 'admin@cyberaudit.com',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Experiment 6: Default admin seeded (admin@cyberaudit.com)');
    }
  } catch (error) {
    console.warn('Admin seed check:', error.message);
  }
}

async function startServer() {
  await connectDB();
  await ensureAdminExists();
  server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT} (0.0.0.0)`));
}

// Start server if run directly
if (require.main === module) {
  startServer();
}

module.exports = app;

