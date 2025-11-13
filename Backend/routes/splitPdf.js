// backend/routes/splitPdf.js
const express = require('express');
const { uploadSinglePdf } = require('../middleware/uploadPdf');
const pdfSplitService = require('../services/pdfSplitService');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

console.log('✓ splitPdf route loaded');

// Define temp directory path
const tempDir = path.join(__dirname, '../temp');

// Ensure temp directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log('Created temp directory at:', tempDir);
}

// Split PDF route
router.post('/split-pdf', uploadSinglePdf.single('pdf'), async (req, res) => {
  console.log('=== SPLIT PDF REQUEST RECEIVED ===');
  console.log('BODY:', req.body);
  console.log('FILE:', req.file);

  let tempFiles = [];

  try {
    // 🔹 Validate file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded'
      });
    }

    const { splitType, splitPoints, pageRanges } = req.body;

    // 🔹 Validate split type
    if (!splitType) {
      return res.status(400).json({
        success: false,
        error: 'No split type specified'
      });
    }

    const pdfPath = req.file.path;
    tempFiles.push(pdfPath);

    console.log(`Processing PDF: ${req.file.originalname}`);
    console.log(`Split Type: ${splitType}`);

    // 🔹 Validate PDF before splitting
    const validation = await pdfSplitService.validatePdf(pdfPath);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid PDF file',
        message: validation.error
      });
    }

    console.log(`PDF validated: ${validation.pageCount} pages`);

    let result;
    let outputFilename;
    let operationType;

    // =====================================================
    // 🔸 Handle Different Split Types
    // =====================================================
    switch (splitType.trim()) {
      // 1️⃣ Split at specific page numbers (e.g. "1,3")
      case 'split-at-pages': {
        if (!splitPoints) {
          return res.status(400).json({
            success: false,
            error: 'No split points specified'
          });
        }

        // ✅ Parse split points safely
        const parsedSplitPoints = typeof splitPoints === 'string'
          ? splitPoints.split(',').map(num => parseInt(num.trim())).filter(n => !isNaN(n))
          : Array.isArray(splitPoints)
          ? splitPoints.map(Number)
          : [];

        if (parsedSplitPoints.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Invalid split points format. Expected comma-separated numbers like "1,3".'
          });
        }

        console.log(`Parsed split points: [${parsedSplitPoints.join(', ')}]`);

        result = await pdfSplitService.splitPdf(pdfPath, parsedSplitPoints);
        operationType = 'split';
        outputFilename = `split-pdf-${uuidv4()}.zip`;
        break;
      }

      // 2️⃣ Extract custom page ranges (e.g. "1-2,4-5")
      case 'extract-ranges': {
        if (!pageRanges) {
          return res.status(400).json({
            success: false,
            error: 'No page ranges specified'
          });
        }

        const ranges = pdfSplitService.parsePageRanges(pageRanges, validation.pageCount);
        console.log('Parsed page ranges:', ranges);

        result = await pdfSplitService.extractPages(pdfPath, ranges);
        operationType = 'extract';
        outputFilename = `extracted-pages-${uuidv4()}.zip`;
        break;
      }

      // 3️⃣ Split into individual pages
      case 'split-individual': {
        result = await pdfSplitService.splitToIndividualPages(pdfPath);
        operationType = 'individual';
        outputFilename = `individual-pages-${uuidv4()}.zip`;
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid split type. Expected one of: split-at-pages, extract-ranges, split-individual'
        });
    }

    // =====================================================
    // 🔸 Create ZIP file
    // =====================================================
    const zipPath = path.join(tempDir, outputFilename);

    const pdfResults =
      operationType === 'split' ? result.splitResults :
      operationType === 'extract' ? result.extractResults :
      result.individualResults;

    console.log(`Creating ZIP with ${pdfResults.length} PDFs...`);

    await pdfSplitService.createZipFromPdfs(pdfResults, zipPath);
    tempFiles.push(zipPath);

    // Construct download URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const downloadUrl = `${baseUrl}/api/split-pdf/download/${outputFilename}`;

    // Cleanup original PDF
    pdfSplitService.cleanupFiles([pdfPath]);

    // Schedule ZIP cleanup after 1 hour
    setTimeout(() => {
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
        console.log(`Cleaned up ZIP file: ${zipPath}`);
      }
    }, 3600000);

    console.log('=== SPLIT COMPLETED SUCCESSFULLY ===');

    // =====================================================
    // 🔸 Response
    // =====================================================
    res.json({
      success: true,
      message: 'PDF split successfully',
      filename: outputFilename,
      downloadUrl,
      fileInfo: {
        originalName: req.file.originalname,
        originalSize: validation.fileSize,
        originalPages: validation.pageCount
      },
      splitResult: {
        operationType,
        totalFiles: pdfResults.length,
        files: pdfResults.map(file => ({
          filename: file.filename,
          pageCount: file.pageCount,
          pageRange:
            file.startPage && file.endPage
              ? `${file.startPage}-${file.endPage}`
              : `Page ${file.pageNumber}`
        }))
      }
    });

  } catch (error) {
    console.error('=== ERROR IN SPLIT PDF ===');
    console.error(error);

    if (tempFiles.length > 0) {
      pdfSplitService.cleanupFiles(tempFiles);
    }

    res.status(500).json({
      success: false,
      error: 'Split failed',
      message: error.message
    });
  }
});

// =====================================================
// 📥 Download Endpoint for ZIP file
// =====================================================
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;

    // Prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }

    const filePath = path.join(tempDir, filename);
    console.log('📥 Looking for file at:', filePath);

    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found:', filePath);
      return res.status(404).json({
        success: false,
        error: 'File not found or expired'
      });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="split-pdf-${Date.now()}.zip"`);
    res.setHeader('Cache-Control', 'no-cache');

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      res.status(500).json({
        success: false,
        error: 'File download failed'
      });
    });

    fileStream.on('end', () => {
      console.log('✅ Download completed:', filename);
    });
  } catch (error) {
    console.error('Download endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Download failed',
      message: error.message
    });
  }
});

// =====================================================
// 🩺 Health Check Endpoint
// =====================================================
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Split PDF API is running',
    timestamp: new Date().toISOString(),
    tempDirExists: fs.existsSync(tempDir),
    tempDirPath: tempDir,
    maxFileSize: '50MB',
    features: {
      splitAtPages: true,
      extractRanges: true,
      splitIndividual: true
    }
  });
});

module.exports = router;
