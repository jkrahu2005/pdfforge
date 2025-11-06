// backend/services/pdfService.js
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class PdfService {
  
  // Convert images to PDF (existing method)
  async imagesToPdf(imagePaths, options = {}) {
    try {
      const pdfDoc = await PDFDocument.create();
      
      for (const imagePath of imagePaths) {
        let imageBuffer = fs.readFileSync(imagePath);
        
        const processedImage = await sharp(imageBuffer)
          .jpeg({ quality: options.quality || 80 })
          .toBuffer();
        
        const image = await pdfDoc.embedJpg(processedImage);
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
      
    } catch (error) {
      throw new Error(`PDF creation failed: ${error.message}`);
    }
  }

  // Convert single image to PDF
 // backend/services/pdfService.js - Update ONLY the convertPdfToImages method
// backend/services/pdfService.js - COMPLETE REPLACEMENT for convertPdfToImages
async convertPdfToImages(pdfPath, outputDir, options = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Starting PDF to JPG conversion...');
      
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Read PDF to get page count
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();
      
      console.log(`PDF has ${pageCount} pages`);
      
      const imagePaths = [];
      const promises = [];

      // Create placeholder images for each page
      for (let i = 0; i < pageCount; i++) {
        const pageNum = i + 1;
        const imagePath = path.join(outputDir, `page_${pageNum}.jpg`);
        
        const promise = new Promise(async (resolvePage, rejectPage) => {
          try {
            // Create SVG placeholder
            const svgContent = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#e6f3ff"/>
              <text x="50%" y="35%" text-anchor="middle" font-family="Arial" font-size="28" fill="#1a56db">PDF to JPG</text>
              <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="20" fill="#374151">Page ${pageNum} of ${pageCount}</text>
              <text x="50%" y="65%" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">Placeholder Image</text>
            </svg>`;
            
            await sharp(Buffer.from(svgContent))
              .jpeg({ quality: 90 })
              .toFile(imagePath);
            
            console.log(`Created image: page_${pageNum}.jpg`);
            imagePaths.push(imagePath);
            resolvePage();
          } catch (error) {
            rejectPage(error);
          }
        });
        
        promises.push(promise);
      }

      // Wait for all images to be created
      await Promise.all(promises);
      console.log(`All ${imagePaths.length} images created successfully`);
      resolve(imagePaths);
      
    } catch (error) {
      console.error('Error in PDF to JPG conversion:', error);
      reject(error);
    }
  });
}

  // PDF to Images conversion with placeholder implementation
  async convertPdfToImages(pdfPath, outputDir, options = {}) {
    try {
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Read PDF to get page count
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();
      
      const imagePaths = [];
      
      // Create placeholder images for each page
      for (let i = 0; i < pageCount; i++) {
        const imagePath = path.join(outputDir, `page_${i + 1}.jpg`);
        
        // Create a placeholder image using sharp
        const placeholderSvg = `
          <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <text x="50%" y="40%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="24" fill="#333">
              Page ${i + 1} of ${pageCount}
            </text>
            <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="18" fill="#666">
              PDF to JPG Conversion
            </text>
            <text x="50%" y="60%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="#999">
              Placeholder - Actual conversion requires setup
            </text>
          </svg>
        `;
        
        await sharp(Buffer.from(placeholderSvg))
          .jpeg({ quality: 80 })
          .toFile(imagePath);
        
        imagePaths.push(imagePath);
      }
      
      return imagePaths;
      
    } catch (error) {
      throw new Error(`PDF to image conversion failed: ${error.message}`);
    }
  }

  // Create zip file of images
  async createZipFromImages(imagePaths, zipPath) {
    return new Promise((resolve, reject) => {
      const archiver = require('archiver');
      const fs = require('fs');

      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      output.on('close', () => {
        resolve(archive.pointer());
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      imagePaths.forEach((imagePath, index) => {
        const fileName = `page_${index + 1}.jpg`;
        archive.file(imagePath, { name: fileName });
      });

      archive.finalize();
    });
  }

  // Clean up temporary files
  cleanupFiles(filePaths) {
    filePaths.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error deleting file:', filePath, error);
      }
    });
  }
}

module.exports = new PdfService();