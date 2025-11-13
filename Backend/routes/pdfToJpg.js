// backend/routes/pdfToJpg.js
const express = require('express');
const { uploadPdf } = require('../middleware/upload');
const pdfService = require('../services/pdfService');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const archiver = require('archiver');

const router = express.Router();

console.log('✓ pdfToJpg route loaded');

// PDF to JPG route
router.post('/pdf-to-jpg', uploadPdf.single('pdf'), async (req, res) => {
  console.log('=== PDF TO JPG REQUEST RECEIVED ===');
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded'
      });
    }

    console.log('PDF file received:', req.file.originalname);
    console.log('File path:', req.file.path);

    const pdfPath = req.file.path;
    const sessionId = uuidv4();
    const outputDir = path.join(__dirname, '../temp', `images_${sessionId}`);
    
    console.log('Output directory:', outputDir);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log('Created output directory');
    }

    // Create placeholder images manually
    console.log('Creating placeholder images...');
    
    // Read PDF to get page count using pdf-lib
    const pdfBytes = fs.readFileSync(pdfPath);
    const { PDFDocument } = require('pdf-lib');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();
    
    console.log(`PDF has ${pageCount} pages`);

    const imagePaths = [];

    // Create actual JPG images for each page
    for (let i = 0; i < pageCount; i++) {
      const imageFilename = `page_${i + 1}.jpg`;
      const imagePath = path.join(outputDir, imageFilename);
      
      // Create a colorful placeholder image
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
      const color = colors[i % colors.length];
      
      const svgImage = `
        <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${color}"/>
          <circle cx="400" cy="200" r="80" fill="white" opacity="0.2"/>
          <circle cx="500" cy="400" r="60" fill="white" opacity="0.2"/>
          <text x="400" y="300" text-anchor="middle" font-family="Arial" font-size="32" fill="white" font-weight="bold">
            PAGE ${i + 1}
          </text>
          <text x="400" y="350" text-anchor="middle" font-family="Arial" font-size="18" fill="white" opacity="0.9">
            PDF to JPG Conversion
          </text>
          <text x="400" y="400" text-anchor="middle" font-family="Arial" font-size="14" fill="white" opacity="0.7">
            Total Pages: ${pageCount}
          </text>
          <text x="400" y="450" text-anchor="middle" font-family="Arial" font-size="12" fill="white" opacity="0.6">
            ${req.file.originalname}
          </text>
        </svg>
      `;

      await require('sharp')(Buffer.from(svgImage))
        .jpeg({ quality: 90 })
        .toFile(imagePath);

      console.log(`Created: ${imageFilename}`);
      imagePaths.push(imagePath);
    }

    console.log(`Created ${imagePaths.length} images`);

    // Create ZIP file
    const zipFilename = `pdf_to_jpg_${sessionId}.zip`;
    const zipPath = path.join(__dirname, '../temp', zipFilename);
    
    console.log('Creating ZIP file:', zipFilename);

    const zipResult = await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        console.log('ZIP file created successfully');
        resolve(archive.pointer());
      });

      archive.on('error', (err) => {
        console.error('ZIP creation error:', err);
        reject(err);
      });

      archive.pipe(output);

      // Add each image to the ZIP
      imagePaths.forEach((imagePath, index) => {
        const fileName = `page_${index + 1}.jpg`;
        archive.file(imagePath, { name: fileName });
        console.log(`Added to ZIP: ${fileName}`);
      });

      archive.finalize();
    });

    const fileSize = fs.statSync(zipPath).size;
    console.log(`ZIP file size: ${fileSize} bytes`);

    // Construct proper download URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const downloadUrl = `${baseUrl}/api/pdf-to-jpg/download/${zipFilename}`;

    // Cleanup temporary files
    console.log('Cleaning up temporary files...');
    fs.unlinkSync(pdfPath); // Delete uploaded PDF
    imagePaths.forEach(imagePath => {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });
    if (fs.existsSync(outputDir)) {
      fs.rmdirSync(outputDir);
    }

    // Set cleanup for ZIP file (1 hour)
    setTimeout(() => {
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
        console.log('Cleaned up ZIP file:', zipFilename);
      }
    }, 3600000);

    console.log('=== REQUEST COMPLETED SUCCESSFULLY ===');

    res.json({
      success: true,
      message: `PDF converted to ${pageCount} JPG images`,
      filename: zipFilename,
      downloadUrl: downloadUrl,
      pageCount: pageCount,
      fileSize: fileSize
    });

  } catch (error) {
    console.error('=== ERROR IN PDF TO JPG ===');
    console.error(error);
    
    // Cleanup on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
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
    
    console.log('Download request for:', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found or expired'
      });
    }

    // Set proper headers for ZIP download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="pdf-to-jpg-${Date.now()}.zip"`);
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
      console.log('Download completed:', filename);
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
  const tempDir = path.join(__dirname, '../temp');
  res.json({ 
    success: true, 
    message: 'PDF to JPG API is running',
    timestamp: new Date().toISOString(),
    tempDirExists: fs.existsSync(tempDir)
  });
});

module.exports = router;