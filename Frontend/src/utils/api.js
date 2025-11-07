// frontend/src/utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export const API_ENDPOINTS = {
  // Convert to PDF
  IMAGES_TO_PDF: `${API_BASE_URL}/api/convert/images-to-pdf`,
  WORD_TO_PDF: `${API_BASE_URL}/api/word-to-pdf/word-to-pdf`,
  POWERPOINT_TO_PDF: `${API_BASE_URL}/api/powerpoint-to-pdf/powerpoint-to-pdf`,
  
  // Convert from PDF
  PDF_TO_JPG: `${API_BASE_URL}/api/pdf-to-jpg/pdf-to-jpg`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`
};

export const uploadFiles = async (endpoint, formData) => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'include',
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