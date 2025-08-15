// server/src/index.ts
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import preferencesRoutes from './routes/preferences';
import workoutRoutes from './routes/workouts';
import adminAuthRoutes from './admin/routes/adminAuth';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (for development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Connect to MongoDB with improved options
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gymsy';
    
    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.db?.databaseName);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Test database connection route
app.get('/api/db-status', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({
      status: 'success',
      database: {
        state: states[dbState as keyof typeof states] || 'unknown',
        host: mongoose.connection.host,
        name: mongoose.connection.name
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection check failed',
      error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
    });
  }
});

// User API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/workouts', workoutRoutes);

// Admin API Routes - FIXED: Mount at /api/admin/auth instead of /api/admin
app.use('/api/admin/auth', adminAuthRoutes);

// Enhanced error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const validationErrors = Object.keys(err.errors).map(key => ({
      field: key,
      message: err.errors[key].message,
      value: err.errors[key].value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validationErrors
    });
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token has expired'
    });
  }
  
  // Default server error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for API routes - Alternative
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found',
      path: req.path,
      method: req.method
    });
  }
  next();
});
// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Handle React routing (SPA fallback)
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🔄 Received shutdown signal, closing server...');
  
  try {
    await mongoose.connection.close();
    console.log('📊 MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🛡️  Admin API: http://localhost:${PORT}/api/admin/auth`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
        console.log(`📋 Health Check: http://localhost:${PORT}/health`);
        console.log(`📚 DB Status: http://localhost:${PORT}/api/db-status`);
      }
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Initialize server
startServer();

export default app;