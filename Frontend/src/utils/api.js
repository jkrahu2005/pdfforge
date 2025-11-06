// frontend/src/utils/api.js

// This will be: http://localhost:5001 in development, your-backend-url in production
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// All our API endpoints in one place
export const API_ENDPOINTS = {
  // Convert to PDF
  IMAGES_TO_PDF: `${API_BASE}/api/convert/images-to-pdf`,
  WORD_TO_PDF: `${API_BASE}/api/word-to-pdf/word-to-pdf`,
  POWERPOINT_TO_PDF: `${API_BASE}/api/powerpoint-to-pdf/powerpoint-to-pdf`,
  
  // Convert from PDF
  PDF_TO_JPG: `${API_BASE}/api/pdf-to-jpg/pdf-to-jpg`,
};

// Helper function for file uploads
export const uploadFiles = async (endpoint, formData) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};