// For Vercel deployment, API calls go to relative paths
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const API_ENDPOINTS = {
  // Convert to PDF
  IMAGES_TO_PDF: `${API_BASE}/convert/images-to-pdf`,
  WORD_TO_PDF: `${API_BASE}/word-to-pdf/word-to-pdf`,
  POWERPOINT_TO_PDF: `${API_BASE}/powerpoint-to-pdf/powerpoint-to-pdf`,
  
  // Convert from PDF
  PDF_TO_JPG: `${API_BASE}/pdf-to-jpg/pdf-to-jpg`,
  
  // Health check
  HEALTH: `${API_BASE}/health`
};

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