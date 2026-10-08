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

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware: Helmet HTTP headers
app.use(helmet());

// Security Middleware: Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
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

async function startServer() {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Start server if run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
