// frontend/src/utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export const API_ENDPOINTS = {
  // Convert to PDF
  IMAGES_TO_PDF: `${API_BASE_URL}/api/convert/images-to-pdf`,
  WORD_TO_PDF: `${API_BASE_URL}/api/word-to-pdf/word-to-pdf`,
  POWERPOINT_TO_PDF: `${API_BASE_URL}/api/powerpoint-to-pdf`, // CHANGED: removed duplicate part
  
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

// Helper function to download converted files
export const downloadFile = async (downloadUrl) => {
  try {
    const response = await fetch(downloadUrl, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Download failed! status: ${response.status}`);
    }

    // Get the blob and create download link
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    
    // Extract filename from Content-Disposition header or use timestamp
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `converted-${Date.now()}.pdf`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

// Health check function
export const checkHealth = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.HEALTH, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Health check failed! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// Specific API functions for different conversion types
export const api = {
  // PowerPoint to PDF
  convertPowerpointToPdf: async (file) => {
    const formData = new FormData();
    formData.append('powerpoint', file);
    return await uploadFiles(API_ENDPOINTS.POWERPOINT_TO_PDF, formData);
  },

  // Word to PDF
  convertWordToPdf: async (file) => {
    const formData = new FormData();
    formData.append('word', file);
    return await uploadFiles(API_ENDPOINTS.WORD_TO_PDF, formData);
  },

  // Images to PDF
  convertImagesToPdf: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    return await uploadFiles(API_ENDPOINTS.IMAGES_TO_PDF, formData);
  },

  // PDF to JPG
  convertPdfToJpg: async (file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    return await uploadFiles(API_ENDPOINTS.PDF_TO_JPG, formData);
  },

  // Download file
  downloadFile,

  // Health check
  checkHealth
};