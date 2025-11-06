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
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'];

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

console.log('Environment:', NODE_ENV);
console.log('Allowed origins:', ALLOWED_ORIGINS);

// CORS configuration - DEVELOPMENT FRIENDLY
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    // Check against allowed origins
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('temp'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Routes
app.use('/api/convert', require('./routes/convertToPdf'));
app.use('/api/pdf-to-jpg', require('./routes/pdfToJpg'));
app.use('/api/word-to-pdf', require('./routes/wordToPdf'));
app.use('/api/powerpoint-to-pdf', require('./routes/powerpointToPdf'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0',
    allowedOrigins: ALLOWED_ORIGINS
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
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Route ${req.originalUrl} does not exist`
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
      message: 'File size exceeds the allowed limit'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: 'Unexpected field',
      message: 'Invalid file field name'
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
app.listen(PORT, () => {
  console.log(`
🚀 PDFMaster Backend Server Started!
📍 Environment: ${NODE_ENV}
📍 Port: ${PORT}
📍 Frontend URL: ${FRONTEND_URL}
📍 Allowed Origins: ${ALLOWED_ORIGINS.join(', ')}
📍 Health Check: http://localhost:${PORT}/health
📍 Time: ${new Date().toISOString()}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});