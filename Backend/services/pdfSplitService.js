// backend/services/pdfSplitService.js
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

class PdfSplitService {
  
  // Split PDF into multiple files at specified page numbers
  async splitPdf(pdfPath, splitAtPages = [], options = {}) {
    try {
      console.log(`Splitting PDF at pages: [${splitAtPages.join(', ')}]`);
      
      const pdfBytes = fs.readFileSync(pdfPath);
      const originalPdf = await PDFDocument.load(pdfBytes);
      
      const totalPages = originalPdf.getPageCount();
      console.log(`Original PDF has ${totalPages} pages`);
      
      // Validate split points
      const invalidPages = splitAtPages.filter(page => page < 1 || page >= totalPages);
      if (invalidPages.length > 0) {
        throw new Error(`Invalid split points: [${invalidPages.join(', ')}]. PDF has ${totalPages} pages.`);
      }
      
      // Add the end of document as final split point
      const splitPoints = [...new Set([...splitAtPages, totalPages])].sort((a, b) => a - b);
      console.log(`Split points: [${splitPoints.join(', ')}]`);
      
      const splitResults = [];
      let startPage = 0; // 0-based index
      
      for (let i = 0; i < splitPoints.length; i++) {
        const endPage = splitPoints[i]; // 1-based page number
        const endIndex = endPage - 1; // Convert to 0-based index
        
        // Create new PDF for this segment
        const newPdf = await PDFDocument.create();
        
        // Copy pages from startPage to endIndex
        for (let j = startPage; j <= endIndex; j++) {
          const [page] = await newPdf.copyPages(originalPdf, [j]);
          newPdf.addPage(page);
        }
        
        const pdfBytes = await newPdf.save();
        const segmentPages = (endIndex - startPage + 1);
        
        splitResults.push({
          pdfBytes: pdfBytes,
          startPage: startPage + 1, // Convert to 1-based for display
          endPage: endPage,
          pageCount: segmentPages,
          filename: `part-${i + 1}-pages-${startPage + 1}-${endPage}.pdf`
        });
        
        console.log(`✓ Created segment ${i + 1}: pages ${startPage + 1}-${endPage} (${segmentPages} pages)`);
        
        startPage = endPage; // Move to next segment
      }
      
      console.log(`✓ Split completed: ${splitResults.length} files created`);
      
      return {
        splitResults: splitResults,
        originalPageCount: totalPages,
        totalSegments: splitResults.length
      };
      
    } catch (error) {
      throw new Error(`PDF split failed: ${error.message}`);
    }
  }

  // Extract specific page ranges from PDF
  async extractPages(pdfPath, pageRanges = [], options = {}) {
    try {
      console.log(`Extracting page ranges:`, pageRanges);
      
      const pdfBytes = fs.readFileSync(pdfPath);
      const originalPdf = await PDFDocument.load(pdfBytes);
      
      const totalPages = originalPdf.getPageCount();
      console.log(`Original PDF has ${totalPages} pages`);
      
      const extractResults = [];
      
      for (let rangeIndex = 0; rangeIndex < pageRanges.length; rangeIndex++) {
        const range = pageRanges[rangeIndex];
        const [start, end] = range;
        
        // Validate range
        if (start < 1 || end > totalPages || start > end) {
          throw new Error(`Invalid page range: ${start}-${end}. PDF has ${totalPages} pages.`);
        }
        
        // Create new PDF for this range
        const newPdf = await PDFDocument.create();
        
        // Copy pages from start to end (convert to 0-based indices)
        for (let i = start - 1; i <= end - 1; i++) {
          const [page] = await newPdf.copyPages(originalPdf, [i]);
          newPdf.addPage(page);
        }
        
        const pdfBytes = await newPdf.save();
        const pageCount = end - start + 1;
        
        extractResults.push({
          pdfBytes: pdfBytes,
          startPage: start,
          endPage: end,
          pageCount: pageCount,
          filename: `pages-${start}-${end}.pdf`
        });
        
        console.log(`✓ Extracted range ${rangeIndex + 1}: pages ${start}-${end} (${pageCount} pages)`);
      }
      
      console.log(`✓ Extraction completed: ${extractResults.length} files created`);
      
      return {
        extractResults: extractResults,
        originalPageCount: totalPages,
        totalFiles: extractResults.length
      };
      
    } catch (error) {
      throw new Error(`Page extraction failed: ${error.message}`);
    }
  }

  // Split PDF into individual pages
  async splitToIndividualPages(pdfPath, options = {}) {
    try {
      const pdfBytes = fs.readFileSync(pdfPath);
      const originalPdf = await PDFDocument.load(pdfBytes);
      
      const totalPages = originalPdf.getPageCount();
      console.log(`Splitting PDF into ${totalPages} individual pages`);
      
      const individualResults = [];
      
      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(originalPdf, [i]);
        newPdf.addPage(page);
        
        const pdfBytes = await newPdf.save();
        
        individualResults.push({
          pdfBytes: pdfBytes,
          pageNumber: i + 1,
          filename: `page-${i + 1}.pdf`
        });
        
        if ((i + 1) % 10 === 0 || i + 1 === totalPages) {
          console.log(`✓ Created page ${i + 1}/${totalPages}`);
        }
      }
      
      console.log(`✓ Individual split completed: ${individualResults.length} files created`);
      
      return {
        individualResults: individualResults,
        originalPageCount: totalPages,
        totalFiles: individualResults.length
      };
      
    } catch (error) {
      throw new Error(`Individual page split failed: ${error.message}`);
    }
  }

  // Create ZIP file from multiple PDFs
  async createZipFromPdfs(pdfResults, zipPath) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      output.on('close', () => {
        console.log(`ZIP file created: ${archive.pointer()} total bytes`);
        resolve(archive.pointer());
      });

      archive.on('error', (err) => {
        console.error('ZIP creation error:', err);
        reject(err);
      });

      archive.pipe(output);

      // Add each PDF to the ZIP
      pdfResults.forEach((result, index) => {
        archive.append(Buffer.from(result.pdfBytes), { name: result.filename });
        console.log(`Added to ZIP: ${result.filename}`);
      });

      archive.finalize();
    });
  }

  // Validate PDF
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

  // Parse split points from string (e.g., "1,3,5")
  parseSplitPoints(splitString, totalPages) {
    try {
      const points = new Set();
      const numbers = splitString.split(',').map(num => parseInt(num.trim()));
      
      for (const num of numbers) {
        if (isNaN(num)) {
          throw new Error(`Invalid number: ${num}`);
        }
        
        if (num < 1 || num >= totalPages) {
          throw new Error(`Split point ${num} is outside valid range (1-${totalPages - 1})`);
        }
        
        points.add(num);
      }
      
      return Array.from(points).sort((a, b) => a - b);
    } catch (error) {
      throw new Error(`Split points parsing failed: ${error.message}`);
    }
  }

  // Parse page ranges from string (e.g., "1-3,5-8")
  parsePageRanges(rangeString, totalPages) {
    try {
      const ranges = [];
      const rangeParts = rangeString.split(',');
      
      for (const part of rangeParts) {
        const trimmed = part.trim();
        
        if (trimmed.includes('-')) {
          const [startStr, endStr] = trimmed.split('-');
          const start = parseInt(startStr.trim());
          const end = parseInt(endStr.trim());
          
          if (isNaN(start) || isNaN(end)) {
            throw new Error(`Invalid range: ${trimmed}`);
          }
          
          if (start < 1 || end > totalPages || start > end) {
            throw new Error(`Range ${start}-${end} is invalid for PDF with ${totalPages} pages`);
          }
          
          ranges.push([start, end]);
        } else {
          const page = parseInt(trimmed);
          
          if (isNaN(page)) {
            throw new Error(`Invalid page number: ${trimmed}`);
          }
          
          if (page < 1 || page > totalPages) {
            throw new Error(`Page ${page} is outside PDF page range (1-${totalPages})`);
          }
          
          ranges.push([page, page]);
        }
      }
      
      return ranges;
    } catch (error) {
      throw new Error(`Page ranges parsing failed: ${error.message}`);
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

module.exports = new PdfSplitService();