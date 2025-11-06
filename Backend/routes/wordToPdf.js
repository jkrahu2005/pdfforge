// backend/routes/wordToPdf.js
const express = require("express");
const { uploadWord } = require("../middleware/upload");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const convert = require("docx-pdf");

const router = express.Router();

// 📍 WORD → PDF Conversion Route
router.post("/word-to-pdf", uploadWord.single("word"), async (req, res) => {
  console.log("=== WORD TO PDF REQUEST RECEIVED ===");

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No Word document uploaded",
      });
    }

    console.log("Word file received:", req.file.originalname);
    console.log("File size:", (req.file.size / 1024 / 1024).toFixed(2), "MB");

    const wordPath = req.file.path;
    const outputFilename = `converted_${uuidv4()}.pdf`;
    const pdfPath = path.join(__dirname, "../temp", outputFilename);

    console.log("Converting DOCX → PDF...");

    // Convert using docx-pdf
    await new Promise((resolve, reject) => {
      convert(wordPath, pdfPath, function (err, result) {
        if (err) reject(err);
        else resolve(result);
      });
    });

    console.log("✅ Conversion successful:", outputFilename);

    const fileSize = fs.statSync(pdfPath).size;
    console.log(`Generated PDF Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

    // Cleanup uploaded DOCX after conversion
    fs.unlinkSync(wordPath);
    console.log("🧹 Cleaned up Word file");

    // Auto-delete PDF after 1 hour
    setTimeout(() => {
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
        console.log("🧹 Cleaned up PDF:", outputFilename);
      }
    }, 3600000);

    res.json({
      success: true,
      message: "Word document converted successfully",
      filename: outputFilename,
      downloadUrl: `/api/word-to-pdf/download/${outputFilename}`,
      fileSize: `${(fileSize / 1024 / 1024).toFixed(2)} MB`,
      originalName: req.file.originalname,
    });
  } catch (error) {
    console.error("❌ ERROR IN WORD TO PDF:", error);

    // Cleanup on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: "Conversion failed",
      message: error.message,
    });
  }
});

// 📥 Download Endpoint
router.get("/download/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../temp", filename);

    console.log("Download request for:", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    const originalName = filename.replace(/^converted_/, "");
    res.download(filePath, `converted-${originalName}.pdf`, (err) => {
      if (err) console.error("Download error:", err);
      else console.log("✅ Download completed:", filename);
    });
  } catch (error) {
    console.error("❌ Download endpoint error:", error);
    res.status(500).json({
      success: false,
      error: "Download failed",
    });
  }
});

// 🩺 Health Check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "WORD to PDF API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
