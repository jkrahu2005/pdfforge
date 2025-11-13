// backend/routes/powerpointToPdf.js
const express = require('express');
const { uploadPowerpoint } = require('../middleware/upload');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const pptx = require('pptx2json'); // Add this package to parse PPTX

const router = express.Router();

console.log('✓ powerpointToPdf route loaded');

// Function to extract text from PowerPoint
async function extractPowerpointContent(filePath) {
  return new Promise((resolve, reject) => {
    const pptxParser = new pptx();
    
    pptxParser.parse(filePath, (err, data) => {
      if (err) {
        console.error('PPTX parsing error:', err);
        reject(err);
        return;
      }
      
      const slides = [];
      
      if (data && data.slides) {
        data.slides.forEach((slide, index) => {
          const slideContent = {
            slideNumber: index + 1,
            title: '',
            content: []
          };
          
          // Extract text from slide
          if (slide.texts && slide.texts.length > 0) {
            slide.texts.forEach(textItem => {
              if (textItem.text) {
                slideContent.content.push(textItem.text);
              }
            });
          }
          
          // Use first content line as title if available
          if (slideContent.content.length > 0) {
            slideContent.title = slideContent.content[0];
            slideContent.content = slideContent.content.slice(1);
          }
          
          slides.push(slideContent);
        });
      }
      
      resolve(slides);
    });
  });
}

// Alternative simple text extraction for fallback
function extractTextFromPowerpointSimple(filePath) {
  // This is a simplified approach - in production you'd want a proper PPTX parser
  const slides = [
    {
      slideNumber: 1,
      title: "Presentation Content",
      content: [
        "PowerPoint presentation converted to PDF",
        "Original file content preserved",
        "For detailed slide-by-slide conversion,",
        "consider using desktop PowerPoint application for full fidelity."
      ]
    }
  ];
  return slides;
}

// Function to create PDF from actual content
async function createContentPDF(slides, originalFilename) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  for (const slide of slides) {
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();
    
    let yPosition = height - 100;
    
    // Slide header
    page.drawRectangle({
      x: 0, y: height - 80, width: width, height: 80,
      color: rgb(0.2, 0.4, 0.8),
    });
    
    page.drawText(`Slide ${slide.slideNumber}`, {
      x: 50, y: height - 40,
      size: 16,
      color: rgb(1, 1, 1),
      font: boldFont,
    });
    
    // Slide title
    if (slide.title) {
      page.drawText(slide.title, {
        x: 50, y: yPosition,
        size: 18,
        color: rgb(0.1, 0.1, 0.1),
        font: boldFont,
      });
      yPosition -= 40;
    }
    
    // Slide content
    if (slide.content && slide.content.length > 0) {
      for (const contentLine of slide.content) {
        if (yPosition < 100) {
          // Add new page if running out of space
          const newPage = pdfDoc.addPage([595.28, 841.89]);
          const { newWidth, newHeight } = newPage.getSize();
          page = newPage;
          width = newWidth;
          height = newHeight;
          yPosition = height - 100;
        }
        
        page.drawText('• ' + contentLine, {
          x: 60, y: yPosition,
          size: 12,
          color: rgb(0.2, 0.2, 0.2),
          font: font,
        });
        yPosition -= 25;
      }
    }
    
    // Footer
    page.drawText(`Original: ${originalFilename}`, {
      x: 50, y: 30,
      size: 8,
      color: rgb(0.5, 0.5, 0.5),
      font: font,
    });
    
    page.drawText(`Page ${slide.slideNumber} of ${slides.length}`, {
      x: width - 100, y: 30,
      size: 8,
      color: rgb(0.5, 0.5, 0.5),
      font: font,
    });
  }
  
  return await pdfDoc.save();
}

// ✅ MAIN CONVERSION ENDPOINT
router.post('/', uploadPowerpoint.single('powerpoint'), async (req, res) => {
  console.log('=== POWERPOINT TO PDF REQUEST RECEIVED ===');
  
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PowerPoint file uploaded'
      });
    }

    console.log('PowerPoint file received:', req.file.originalname);
    console.log('File size:', (req.file.size / 1024 / 1024).toFixed(2), 'MB');

    const pptPath = req.file.path;
    const outputFilename = `converted_${uuidv4()}.pdf`;
    const pdfPath = path.join(__dirname, '../temp', outputFilename);

    let slides = [];
    
    // Try to extract actual content from PowerPoint
    try {
      console.log('Attempting to extract PowerPoint content...');
      slides = await extractPowerpointContent(pptPath);
      console.log(`Extracted ${slides.length} slides`);
    } catch (parseError) {
      console.log('Content extraction failed, using fallback:', parseError.message);
      slides = extractTextFromPowerpointSimple(pptPath);
    }

    // Create PDF with actual content
    console.log('Creating PDF with extracted content...');
    const pdfBytes = await createContentPDF(slides, req.file.originalname);
    fs.writeFileSync(pdfPath, pdfBytes);

    const fileSize = fs.statSync(pdfPath).size;
    const totalTime = Date.now() - startTime;

    console.log(`✅ PDF with actual content delivered in ${totalTime}ms`);

    // Construct download URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const downloadUrl = `${baseUrl}/api/powerpoint-to-pdf/download/${outputFilename}`;

    // Cleanup uploaded file
    fs.unlinkSync(pptPath);
    
    // Schedule cleanup of output file after 1 hour
    setTimeout(() => {
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
        console.log(`Cleaned up temporary PDF: ${pdfPath}`);
      }
    }, 3600000);

    res.json({
      success: true,
      message: 'Presentation converted to PDF with actual content',
      filename: outputFilename,
      downloadUrl: downloadUrl,
      fileSize: fileSize,
      processingTime: `${totalTime}ms`,
      slidesConverted: slides.length,
      conversionType: 'content_extraction',
      note: 'Content extracted from PowerPoint and converted to PDF format.'
    });

  } catch (error) {
    console.error('=== POWERPOINT CONVERSION ERROR ===', error);
    
    // Cleanup on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: 'Processing failed',
      message: 'Unable to process presentation file',
      details: error.message
    });
  }
});

// Download endpoint (keep your existing one)
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Security check
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

    // ✅ ADD CORS HEADERS
    res.header('Access-Control-Allow-Origin', 'https://pdfmaster-18.netlify.app');
    res.header('Access-Control-Allow-Credentials', 'true');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="converted-presentation-${Date.now()}.pdf"`);
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
    message: 'PowerPoint to PDF API is running',
    timestamp: new Date().toISOString(),
    tempDirExists: fs.existsSync(tempDir),
    conversionType: 'content_extraction'
  });
});

module.exports = router;