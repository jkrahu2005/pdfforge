// backend/routes/wordToPdf.js
const express = require("express");
const { uploadWord } = require("../middleware/upload");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// 📍 WORD → PDF Conversion Route (Placeholder)
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

    // Cleanup uploaded file immediately since we can't convert yet
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log("🧹 Cleaned up uploaded Word file");
    }

    console.log("⚠️ Word to PDF conversion - feature coming soon");

    res.json({
      success: true,
      message: "Word document received successfully",
      note: "Word to PDF conversion feature is coming soon. Currently in development.",
      originalName: req.file.originalname,
      status: "placeholder",
      plannedFeatures: [
        "DOCX to PDF conversion",
        "DOC to PDF conversion",
        "Batch conversion support",
        "Format preservation"
      ]
    });

  } catch (error) {
    console.error("❌ ERROR IN WORD TO PDF:", error);

    // Cleanup on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: "Processing failed",
      message: error.message,
    });
  }
});

// 📥 Download Endpoint (Placeholder)
router.get("/download/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    
    console.log("Download request for:", filename);

    res.status(503).json({
      success: false,
      error: "Service temporarily unavailable",
      message: "Word to PDF conversion is currently in development. Check back soon!",
      expectedCompletion: "Coming in next update"
    });

  } catch (error) {
    console.error("❌ Download endpoint error:", error);
    res.status(500).json({
      success: false,
      error: "Download service unavailable",
    });
  }
});

// 🩺 Health Check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "WORD to PDF API is running (placeholder mode)",
    timestamp: new Date().toISOString(),
    status: "active_but_limited",
    features: {
      fileUpload: "available",
      conversion: "coming_soon",
      download: "coming_soon"
    }
  });
});

module.exports = router;