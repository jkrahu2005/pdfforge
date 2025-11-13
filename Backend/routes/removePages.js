// backend/routes/removePages.js
const express = require('express');
const { uploadSinglePdf } = require('../middleware/uploadPdf');
const pdfRemovePagesService = require('../services/pdfRemovePagesService');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

console.log('✓ removePages route loaded');

// Define temp directory path
const tempDir = path.join(__dirname, '../temp');

// Remove Pages route
router.post('/remove-pages', uploadSinglePdf.single('pdf'), async (req, res) => {
  console.log('=== REMOVE PAGES REQUEST RECEIVED ===');
  
  let tempFiles = [];
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded'
      });
    }

    const { pages } = req.body;
    
    if (!pages) {
      return res.status(400).json({
        success: false,
        error: 'No pages specified for removal'
      });
    }

    console.log(`Processing PDF for page removal: ${req.file.originalname}`);
    console.log(`Pages to remove: ${pages}`);
    
    // Collect file path for cleanup
    tempFiles.push(req.file.path);
    const pdfPath = req.file.path;

    // Validate PDF first
    console.log('Validating PDF file...');
    const validation = await pdfRemovePagesService.validatePdf(pdfPath);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid PDF file',
        message: validation.error
      });
    }

    console.log(`PDF validated: ${validation.pageCount} pages`);

    // Parse page ranges
    let pagesToRemove;
    try {
      pagesToRemove = pdfRemovePagesService.parsePageRanges(pages, validation.pageCount);
      console.log(`Parsed pages to remove: [${pagesToRemove.join(', ')}]`);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page specification',
        message: parseError.message,
        totalPages: validation.pageCount
      });
    }

    if (pagesToRemove.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid pages specified for removal'
      });
    }

    // Remove pages
    console.log('Starting page removal...');
    const removeResult = await pdfRemovePagesService.removePages(pdfPath, pagesToRemove);

    // Save modified PDF
    const outputFilename = `removed-pages-${uuidv4()}.pdf`;
    const outputPath = path.join(tempDir, outputFilename);
    
    console.log('💾 Saving modified PDF to:', outputPath);
    
    fs.writeFileSync(outputPath, removeResult.pdfBytes);
    tempFiles.push(outputPath);

    // Construct download URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const downloadUrl = `${baseUrl}/api/remove-pages/download/${outputFilename}`;

    // Cleanup input file after successful processing
    pdfRemovePagesService.cleanupFiles([pdfPath]);

    // Schedule cleanup of output file after 1 hour
    setTimeout(() => {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
        console.log(`Cleaned up modified PDF: ${outputPath}`);
      }
    }, 3600000);

    console.log('=== PAGE REMOVAL COMPLETED SUCCESSFULLY ===');

    res.json({
      success: true,
      message: 'Pages removed successfully',
      filename: outputFilename,
      downloadUrl: downloadUrl,
      fileInfo: {
        originalName: req.file.originalname,
        originalSize: validation.fileSize,
        originalPages: validation.pageCount
      },
      removalResult: {
        removedPages: removeResult.removedPages,
        removedCount: removeResult.removedPageCount,
        remainingCount: removeResult.remainingPageCount,
        outputFileSize: Buffer.byteLength(removeResult.pdfBytes)
      }
    });

  } catch (error) {
    console.error('=== ERROR IN REMOVE PAGES ===');
    console.error(error);
    
    // Cleanup any temporary files on error
    if (tempFiles.length > 0) {
      pdfRemovePagesService.cleanupFiles(tempFiles);
    }
    
    res.status(500).json({
      success: false,
      error: 'Page removal failed',
      message: error.message
    });
  }
});

// Download endpoint for modified PDF
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Security check: prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }
    
    const filePath = path.join(tempDir, filename);
    
    console.log('📥 Looking for file at:', filePath);
    console.log('📥 File exists?', fs.existsSync(filePath));
    
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found at:', filePath);
      return res.status(404).json({
        success: false,
        error: 'File not found or expired'
      });
    }

    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="pages-removed-${Date.now()}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Stream the file
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

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Remove Pages API is running',
    timestamp: new Date().toISOString(),
    tempDirExists: fs.existsSync(tempDir),
    tempDirPath: tempDir,
    maxFileSize: '50MB',
    features: {
      singlePageRemoval: true,
      pageRangeRemoval: true,
      multiplePagesRemoval: true
    }
  });
});

module.exports = router;