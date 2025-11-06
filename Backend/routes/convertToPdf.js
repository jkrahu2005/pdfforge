// backend/routes/convertToPdf.js
const express = require('express');
const { uploadImages } = require('../middleware/upload');
const pdfService = require('../services/pdfService');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// JPG/Images to PDF
router.post('/images-to-pdf', uploadImages.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images uploaded'
      });
    }

    console.log(`Processing ${req.files.length} images to PDF`);

    const imagePaths = req.files.map(file => file.path);
    
    const pdfBytes = await pdfService.imagesToPdf(imagePaths, {
      quality: req.body.quality || 80
    });

    const outputFilename = `converted-${uuidv4()}.pdf`;
    const outputPath = path.join(__dirname, '../temp', outputFilename);
    
    fs.writeFileSync(outputPath, pdfBytes);

    pdfService.cleanupFiles(imagePaths);

    setTimeout(() => {
      pdfService.cleanupFiles([outputPath]);
    }, 3600000);

    res.json({
      success: true,
      message: 'PDF created successfully',
      filename: outputFilename,
      downloadUrl: `/api/convert/download/${outputFilename}`,
      fileSize: Buffer.byteLength(pdfBytes)
    });

  } catch (error) {
    console.error('Error converting images to PDF:', error);
    
    if (req.files) {
      pdfService.cleanupFiles(req.files.map(file => file.path));
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
    const filePath = path.join(__dirname, '../temp', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.download(filePath, `converted-${Date.now()}.pdf`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Download failed'
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Convert to PDF API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;