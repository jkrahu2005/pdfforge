// backend/middleware/uploadPdf.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Use environment variables
const FILE_SIZE_LIMIT = process.env.FILE_SIZE_LIMIT || '50MB';

const parseSize = (sizeStr) => {
  const units = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
  const match = sizeStr.match(/^(\d+)([BKMGT]?B)$/i);
  if (!match) return 50 * 1024 * 1024;
  const [, value, unit] = match;
  return parseInt(value) * (units[unit.toUpperCase()] || 1);
};

const maxFileSize = parseSize(FILE_SIZE_LIMIT);

// Configure storage for PDF files
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

// File filter for PDFs
const pdfFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/octet-stream'
  ];
  
  const allowedExtensions = ['.pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// Create upload middleware for multiple PDFs
const uploadMultiplePdfs = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize,
    files: 20
  },
  fileFilter: pdfFileFilter
});

// Create upload middleware for single PDF
const uploadSinglePdf = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize,
    files: 1
  },
  fileFilter: pdfFileFilter
});

module.exports = {
  uploadMultiplePdfs,
  uploadSinglePdf
};