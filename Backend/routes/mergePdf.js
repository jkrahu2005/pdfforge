const express = require('express');
const { uploadMultiplePdfs } = require('../middleware/uploadPdf');
const pdfMergeService = require('../services/pdfMergeService');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

console.log('✓ mergePdf route loaded');

router.post('/merge-pdf', uploadMultiplePdfs.array('pdfs', 20), async (req, res) => {
  console.log('=== MERGE PDF REQUEST RECEIVED ===');

  let tempFiles = [];

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No PDF files uploaded' });
    }

    if (req.files.length < 2) {
      return res.status(400).json({ success: false, error: 'Please upload at least 2 PDF files to merge' });
    }

    tempFiles = req.files.map(file => file.path);
    const pdfPaths = tempFiles;

    console.log(`Processing ${req.files.length} PDF files for merging`);

    const validationResults = await pdfMergeService.validatePdfs(pdfPaths);
    const invalidFiles = validationResults.filter(r => !r.valid);

    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Some PDF files are invalid or corrupted',
        invalidFiles: invalidFiles.map(f => ({ filename: f.filename, error: f.error })),
      });
    }

    const fileInfo = validationResults.map(result => ({
      filename: result.filename,
      pageCount: result.pageCount,
      fileSize: result.fileSize,
    }));

    const totalPages = fileInfo.reduce((sum, file) => sum + file.pageCount, 0);
    console.log(`Total pages across all files: ${totalPages}`);

    const mergeResult = await pdfMergeService.mergePdfs(pdfPaths);
    const outputFilename = `merged-${uuidv4()}.pdf`;
    const outputPath = path.join(__dirname, '../temp', outputFilename);

    fs.writeFileSync(outputPath, mergeResult.pdfBytes);
    console.log('✅ Merged PDF saved at:', outputPath);

    // Cleanup only INPUT files, not output
    pdfMergeService.cleanupFiles(pdfPaths);

    // Schedule cleanup of output file after 1 hour
    setTimeout(() => {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
        console.log(`🧹 Cleaned up merged PDF: ${outputPath}`);
      }
    }, 3600000);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const downloadUrl = `${baseUrl}/api/merge-pdf/download/${outputFilename}`;

    res.json({
      success: true,
      message: 'PDFs merged successfully',
      filename: outputFilename,
      downloadUrl,
      fileInfo,
      mergeResult: {
        totalFiles: mergeResult.fileCount,
        totalPages: mergeResult.totalPages,
        outputFileSize: Buffer.byteLength(mergeResult.pdfBytes),
      },
    });

  } catch (error) {
    console.error('❌ Merge error:', error);
    pdfMergeService.cleanupFiles(tempFiles);
    res.status(500).json({ success: false, error: 'Merge failed', message: error.message });
  }
});

// ✅ Fixed download route
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ success: false, error: 'Invalid filename' });
    }

    const filePath = path.join(__dirname, '../temp', filename);
    console.log('📁 Looking for file at:', filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found or expired' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="merged-${Date.now()}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache');

    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, error: 'Download failed', message: error.message });
  }
});

module.exports = router;
