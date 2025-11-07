// backend/routes/convertToPdf.js
const express = require('express');
const { uploadImages } = require('../middleware/upload');
const pdfService = require('../services/pdfService');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

console.log('✓ convertToPdf route loaded');

// JPG/Images to PDF
router.post('/images-to-pdf', uploadImages.array('images', 20), async (req, res) => {
  let tempFiles = [];
  
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images uploaded'
      });
    }

    console.log(`Processing ${req.files.length} images to PDF`);
    tempFiles = req.files.map(file => file.path);

    const imagePaths = req.files.map(file => file.path);
    
    const pdfBytes = await pdfService.imagesToPdf(imagePaths, {
      quality: req.body.quality || 80
    });

    const outputFilename = `converted-${uuidv4()}.pdf`;
    const outputPath = path.join(__dirname, '../temp', outputFilename);
    
    fs.writeFileSync(outputPath, pdfBytes);
    tempFiles.push(outputPath);

    // Construct proper download URL for production
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const downloadUrl = `${baseUrl}/api/convert/download/${outputFilename}`;

    // Cleanup input files after conversion
    pdfService.cleanupFiles(imagePaths);

    // Schedule cleanup of output file after 1 hour
    setTimeout(() => {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
        console.log(`Cleaned up temporary file: ${outputPath}`);
      }
    }, 3600000);

    res.json({
      success: true,
      message: 'PDF created successfully',
      filename: outputFilename,
      downloadUrl: downloadUrl,
      fileSize: Buffer.byteLength(pdfBytes),
      pages: req.files.length
    });

  } catch (error) {
    console.error('Error converting images to PDF:', error);
    
    // Cleanup any temporary files on error
    if (tempFiles.length > 0) {
      pdfService.cleanupFiles(tempFiles);
    }
    
    res.status(500).json({
      success: false,
      error: 'Conversion failed',
      message: error.message
    });
  }
});

// Download endpoint
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
    
    const filePath = path.join(__dirname, '../temp', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found or expired'
      });
    }

    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="converted-${Date.now()}.pdf"`);
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

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: 'Download failed',
      message: error.message
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  const tempDir = path.join(__dirname, '../temp');
  res.json({ 
    success: true, 
    message: 'Convert to PDF API is running',
    timestamp: new Date().toISOString(),
    tempDirExists: fs.existsSync(tempDir)
  });
});

module.exports = router;