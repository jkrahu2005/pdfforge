// backend/services/pdfRemovePagesService.js
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

class PdfRemovePagesService {
  
  // Remove specified pages from PDF
  async removePages(pdfPath, pagesToRemove, options = {}) {
    try {
      console.log(`Removing pages: [${pagesToRemove.join(', ')}] from PDF`);
      
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      
      const totalPages = pdfDoc.getPageCount();
      console.log(`Original PDF has ${totalPages} pages`);
      
      // Validate page numbers
      const invalidPages = pagesToRemove.filter(page => page < 1 || page > totalPages);
      if (invalidPages.length > 0) {
        throw new Error(`Invalid page numbers: [${invalidPages.join(', ')}]. PDF has only ${totalPages} pages.`);
      }
      
      if (pagesToRemove.length >= totalPages) {
        throw new Error('Cannot remove all pages from PDF');
      }
      
      // Create new PDF without the specified pages
      const newPdf = await PDFDocument.create();
      
      // Copy all pages except the ones to remove
      for (let i = 0; i < totalPages; i++) {
        const pageNumber = i + 1;
        if (!pagesToRemove.includes(pageNumber)) {
          const [page] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(page);
          console.log(`✓ Kept page ${pageNumber}`);
        } else {
          console.log(`✗ Removed page ${pageNumber}`);
        }
      }
      
      const newPdfBytes = await newPdf.save();
      const remainingPages = newPdf.getPageCount();
      
      console.log(`✓ Remove pages completed: ${remainingPages} pages remaining`);
      
      return {
        pdfBytes: newPdfBytes,
        originalPageCount: totalPages,
        removedPageCount: pagesToRemove.length,
        remainingPageCount: remainingPages,
        removedPages: pagesToRemove
      };
      
    } catch (error) {
      throw new Error(`Remove pages failed: ${error.message}`);
    }
  }

  // Validate PDF and get page count
  async validatePdf(pdfPath) {
    try {
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();
      const fileSize = fs.statSync(pdfPath).size;
      
      return {
        valid: true,
        pageCount: pageCount,
        fileSize: fileSize,
        error: null
      };
    } catch (error) {
      return {
        valid: false,
        pageCount: 0,
        fileSize: 0,
        error: error.message
      };
    }
  }

  // Parse page ranges (e.g., "1,3,5-8")
  parsePageRanges(rangeString, totalPages) {
    try {
      const pages = new Set();
      const ranges = rangeString.split(',');
      
      for (const range of ranges) {
        const trimmed = range.trim();
        
        if (trimmed.includes('-')) {
          // Handle range (e.g., "1-5")
          const [start, end] = trimmed.split('-').map(num => parseInt(num.trim()));
          
          if (isNaN(start) || isNaN(end)) {
            throw new Error(`Invalid range: ${trimmed}`);
          }
          
          if (start > end) {
            throw new Error(`Invalid range: ${start}-${end} (start > end)`);
          }
          
          if (start < 1 || end > totalPages) {
            throw new Error(`Range ${start}-${end} is outside PDF page range (1-${totalPages})`);
          }
          
          for (let i = start; i <= end; i++) {
            pages.add(i);
          }
        } else {
          // Handle single page (e.g., "1")
          const pageNum = parseInt(trimmed);
          
          if (isNaN(pageNum)) {
            throw new Error(`Invalid page number: ${trimmed}`);
          }
          
          if (pageNum < 1 || pageNum > totalPages) {
            throw new Error(`Page ${pageNum} is outside PDF page range (1-${totalPages})`);
          }
          
          pages.add(pageNum);
        }
      }
      
      return Array.from(pages).sort((a, b) => a - b);
    } catch (error) {
      throw new Error(`Page range parsing failed: ${error.message}`);
    }
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

module.exports = new PdfRemovePagesService();