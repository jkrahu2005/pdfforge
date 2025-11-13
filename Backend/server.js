// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// ✅ Environment Variables
const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['http://localhost:5173', 'http://localhost:3000','http://localhost:5174'];
const FILE_SIZE_LIMIT = process.env.FILE_SIZE_LIMIT || '50MB';
const UPLOAD_LIMIT = parseInt(process.env.UPLOAD_LIMIT) || 20;

console.log('🚀 PDFMaster Backend Starting...');
console.log('🔧 Environment:', { 
  PORT, 
  FRONTEND_URL, 
  NODE_ENV,
  ALLOWED_ORIGINS,
  FILE_SIZE_LIMIT,
  UPLOAD_LIMIT
});

// ✅ CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.some(allowed => origin.includes(allowed))) {
      callback(null, true);
    } else {
      console.log('🔒 CORS Blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ✅ Apply headers explicitly
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.json({ limit: FILE_SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: FILE_SIZE_LIMIT }));

// ✅ Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}
app.use('/temp', express.static(tempDir));

// ✅ Routes
app.use('/api/convert', require('./routes/convertToPdf'));
app.use('/api/pdf-to-jpg', require('./routes/pdfToJpg'));
app.use('/api/word-to-pdf', require('./routes/wordToPdf'));
app.use('/api/powerpoint-to-pdf', require('./routes/powerpointToPdf'));
app.use('/api/merge-pdf', require('./routes/mergePdf'));
app.use('/api/remove-pages', require('./routes/removePages'));
app.use('/api/split-pdf', require('./routes/splitPdf'));

// ✅ Health check
app.get('/', (req, res) => res.json({ 
  success: true, 
  message: '🚀 PDFMaster API is running',
  environment: NODE_ENV,
  timestamp: new Date().toISOString()
}));

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '✅ Backend is healthy',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    configurations: {
      fileSizeLimit: FILE_SIZE_LIMIT,
      uploadLimit: UPLOAD_LIMIT,
      allowedOrigins: ALLOWED_ORIGINS
    }
  });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message,
    environment: NODE_ENV
  });
});

// ✅ Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🌐 Environment: ${NODE_ENV}`);
});

module.exports = app;