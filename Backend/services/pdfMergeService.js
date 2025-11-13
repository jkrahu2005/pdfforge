// backend/services/pdfMergeService.js
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

class PdfMergeService {
  
  // Merge multiple PDFs into one
  async mergePdfs(pdfPaths, options = {}) {
    try {
      console.log(`Starting to merge ${pdfPaths.length} PDF files`);
      
      const mergedPdf = await PDFDocument.create();
      
      for (const pdfPath of pdfPaths) {
        try {
          console.log(`Processing: ${path.basename(pdfPath)}`);
          
          const pdfBytes = fs.readFileSync(pdfPath);
          const pdfDoc = await PDFDocument.load(pdfBytes);
          
          // Copy all pages from current PDF
          const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          
          // Add each page to merged PDF
          pages.forEach(page => {
            mergedPdf.addPage(page);
          });
          
          console.log(`✓ Added ${pdfDoc.getPageCount()} pages from ${path.basename(pdfPath)}`);
          
        } catch (error) {
          console.error(`Error processing ${pdfPath}:`, error);
          throw new Error(`Failed to process ${path.basename(pdfPath)}: ${error.message}`);
        }
      }
      
      const mergedPdfBytes = await mergedPdf.save();
      const totalPages = mergedPdf.getPageCount();
      
      console.log(`✓ Merge completed: ${totalPages} total pages`);
      
      return {
        pdfBytes: mergedPdfBytes,
        totalPages: totalPages,
        fileCount: pdfPaths.length
      };
      
    } catch (error) {
      throw new Error(`PDF merge failed: ${error.message}`);
    }
  }

  // Validate PDF files before merging
  async validatePdfs(pdfPaths) {
    const validationResults = [];
    
    for (const pdfPath of pdfPaths) {
      try {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pageCount = pdfDoc.getPageCount();
        const fileSize = fs.statSync(pdfPath).size;
        
        validationResults.push({
          filename: path.basename(pdfPath),
          valid: true,
          pageCount: pageCount,
          fileSize: fileSize,
          error: null
        });
        
      } catch (error) {
        validationResults.push({
          filename: path.basename(pdfPath),
          valid: false,
          pageCount: 0,
          fileSize: 0,
          error: error.message
        });
      }
    }
    
    return validationResults;
  }

  // Clean up temporary files
  cleanupFiles(filePaths) {
    filePaths.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up: ${filePath}`);
        }
      } catch (error) {
        console.error('Error deleting file:', filePath, error);
      }
    });
  }
}

module.exports = new PdfMergeService();