const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

// Ensure .env is reliably loaded from backend directory
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const auditLogRoutes = require('./routes/auditLogRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (Docker/Nginx)
app.set('trust proxy', 1);

// Security Middleware: Helmet HTTP headers
app.use(helmet());

// Security Middleware: Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:80',
      'http://localhost',
    ],
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

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// MongoDB Atlas connection logic (Atlas only - no local fallback)
async function connectDB() {
  const uri = process.env.MONGO_URI;

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
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT} (0.0.0.0)`));
}

// Start server if run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
