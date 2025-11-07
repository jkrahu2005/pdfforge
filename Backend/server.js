// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Environment variables
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173','https://pdf-master18.netlify.app'];

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

console.log('Environment:', NODE_ENV);
console.log('Allowed origins:', ALLOWED_ORIGINS);

// CORS configuration - PRODUCTION READY
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check against allowed origins
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Disposition']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/temp', express.static(path.join(__dirname, 'temp'), {
  setHeaders: (res, path) => {
    // Set proper headers for file downloads
    if (path.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (path.endsWith('.zip')) {
      res.setHeader('Content-Type', 'application/zip');
    }
    res.setHeader('Cache-Control', 'no-cache');
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'} - IP: ${req.ip}`);
  next();
});

// Security headers middleware
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  next();
});

// Debug: Check if route files exist
console.log('Checking route files...');
const routes = {
  convertToPdf: path.join(__dirname, 'routes/convertToPdf.js'),
  pdfToJpg: path.join(__dirname, 'routes/pdfToJpg.js'),
  wordToPdf: path.join(__dirname, 'routes/wordToPdf.js'),
  powerpointToPdf: path.join(__dirname, 'routes/powerpointToPdf.js')
};

Object.entries(routes).forEach(([name, routePath]) => {
  console.log(`${name}: ${fs.existsSync(routePath) ? '✓ EXISTS' : '✗ MISSING'}`);
});

// Routes with error handling
try {
  console.log('Loading routes...');
  
  // Mount routes
  app.use('/api/convert', require('./routes/convertToPdf'));
  app.use('/api/pdf-to-jpg', require('./routes/pdfToJpg'));
  app.use('/api/word-to-pdf', require('./routes/wordToPdf'));
  app.use('/api/powerpoint-to-pdf', require('./routes/powerpointToPdf'));
  
  console.log('✓ All routes mounted successfully');
} catch (error) {
  console.error('❌ ERROR LOADING ROUTES:', error);
  console.error('Route loading failed, server will not function properly');
}

// Debug endpoint to check all registered routes
app.get('/debug-routes', (req, res) => {
  const routes = [];
  
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Regular routes
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      // Router middleware
      if (middleware.handle.stack) {
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            routes.push({
              path: middleware.regexp.toString() + handler.route.path,
              methods: Object.keys(handler.route.methods)
            });
          }
        });
      }
    }
  });
  
  res.json({ routes });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0',
    allowedOrigins: ALLOWED_ORIGINS,
    tempDir: fs.existsSync(tempDir) ? 'exists' : 'missing',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PDFMaster Backend API',
    version: '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      health: '/health',
      convert: '/api/convert',
      pdfToJpg: '/api/pdf-to-jpg',
      wordToPdf: '/api/word-to-pdf',
      powerpointToPdf: '/api/powerpoint-to-pdf'
    },
    documentation: 'See /health for API status'
  });
});

// 404 handler - UPDATED with correct endpoint paths
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Route ${req.originalUrl} does not exist`,
    availableEndpoints: [
      '/health',
      '/debug-routes',
      '/api/convert/images-to-pdf',
      '/api/pdf-to-jpg/pdf-to-jpg',
      '/api/word-to-pdf/word-to-pdf',
      '/api/powerpoint-to-pdf'  // CHANGED: removed duplicate part
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  
  // CORS errors
  if (err.message && err.message.includes('Not allowed by CORS')) {
    return res.status(403).json({
      success: false,
      error: 'CORS Error',
      message: `Origin not allowed. Your origin: ${req.headers.origin}`,
      allowedOrigins: ALLOWED_ORIGINS
    });
  }
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File too large',
      message: 'File size exceeds the allowed limit (50MB)'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Unexpected field',
      message: 'Invalid file field name'
    });
  }

  // File system errors
  if (err.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      error: 'File not found',
      message: 'The requested file does not exist or has expired'
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 PDFMaster Backend Server Started!
📍 Environment: ${NODE_ENV}
📍 Port: ${PORT}
📍 Frontend URL: ${FRONTEND_URL}
📍 Allowed Origins: ${ALLOWED_ORIGINS.join(', ')}
📍 Health Check: http://localhost:${PORT}/health
📍 Debug Routes: http://localhost:${PORT}/debug-routes
📍 Time: ${new Date().toISOString()}
📍 Temp Directory: ${fs.existsSync(tempDir) ? '✓ Ready' : '✗ Missing'}

📋 AVAILABLE ENDPOINTS:
  • POST /api/convert/images-to-pdf
  • POST /api/pdf-to-jpg/pdf-to-jpg  
  • POST /api/word-to-pdf/word-to-pdf
  • POST /api/powerpoint-to-pdf
  • GET  /api/powerpoint-to-pdf/download/:filename
  • GET  /health
  • GET  /debug-routes
  `);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received, shutting down gracefully...`);
  
  server.close((err) => {
    if (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
    
    console.log('Server closed successfully.');
    
    // Cleanup temp directory on shutdown in production
    if (NODE_ENV === 'production') {
      try {
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
          console.log('Temporary files cleaned up.');
        }
      } catch (cleanupError) {
        console.error('Error cleaning up temp directory:', cleanupError);
      }
    }
    
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forcing shutdown after timeout...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});