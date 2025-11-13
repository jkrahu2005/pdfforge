// backend/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Use environment variables
const FILE_SIZE_LIMIT = process.env.FILE_SIZE_LIMIT || '50MB';
const UPLOAD_LIMIT = parseInt(process.env.UPLOAD_LIMIT) || 20;

// Helper to parse size string
const parseSize = (sizeStr) => {
  const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
  const match = sizeStr.match(/^(\d+)([BKMGT]?B)$/i);
  if (!match) return 50 * 1024 * 1024;
  
  const [, value, unit] = match;
  return parseInt(value) * (units[unit.toUpperCase()] || 1);
};

const maxFileSize = parseSize(FILE_SIZE_LIMIT);
const maxFiles = UPLOAD_LIMIT;

console.log(`Upload configuration - Max file size: ${FILE_SIZE_LIMIT}, Max files: ${maxFiles}`);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// File filter for PDFs
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// File filter for Word documents
const wordFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-word',
    'application/octet-stream'
  ];
  
  const allowedExtensions = ['.doc', '.docx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only Word documents (.doc, .docx) are allowed!'), false);
  }
};

// File filter for PowerPoint documents
const powerpointFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
    'application/octet-stream'
  ];
  
  const allowedExtensions = ['.ppt', '.pptx'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only PowerPoint documents (.ppt, .pptx) are allowed!'), false);
  }
};

// Create different upload middlewares
const uploadImages = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize,
    files: maxFiles
  },
  fileFilter: imageFileFilter
});

const uploadPdf = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize,
    files: 1
  },
  fileFilter: pdfFileFilter
});

const uploadWord = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize,
    files: 1
  },
  fileFilter: wordFileFilter
});

const uploadPowerpoint = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize,
    files: 1
  },
  fileFilter: powerpointFileFilter
});

module.exports = {
  uploadImages,
  uploadPdf,
  uploadWord,
  uploadPowerpoint
};