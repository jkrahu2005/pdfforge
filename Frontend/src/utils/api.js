// frontend/src/utils/api.js
// ✅ CHANGED: Updated to live backend URL
const API_BASE_URL ='https://pdfmaster-backend-ao3x.onrender.com'

// ✅ HTTPS Helper function
const forceHttps = (url) => {
  if (url && url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
};

export const API_ENDPOINTS = {
  // Convert to PDF
  IMAGES_TO_PDF: `${API_BASE_URL}/api/convert/images-to-pdf`,
  WORD_TO_PDF: `${API_BASE_URL}/api/word-to-pdf`,
  POWERPOINT_TO_PDF: `${API_BASE_URL}/api/powerpoint-to-pdf`,
  
  // Convert from PDF
  PDF_TO_JPG: `${API_BASE_URL}/api/pdf-to-jpg`,
  
  // Organize PDF
  MERGE_PDF: `${API_BASE_URL}/api/merge-pdf/merge-pdf`,
  REMOVE_PAGES: `${API_BASE_URL}/api/remove-pages/remove-pages`,
  SPLIT_PDF: `${API_BASE_URL}/api/split-pdf/split-pdf`,
  
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

    const result = await response.json();
    
    // ✅ FIX: Convert any download URLs to HTTPS in the response
    if (result.downloadUrl) {
      result.downloadUrl = forceHttps(result.downloadUrl);
    }
    
    return result;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Helper function to download converted files
// ✅ NEW VERSION (fixes CORS):
export const downloadFile = async (downloadUrl) => {
  try {
    // ✅ FORCE HTTPS - More aggressive fix
    let secureUrl = downloadUrl;
    if (downloadUrl.startsWith('http://')) {
      secureUrl = downloadUrl.replace('http://', 'https://');
    } else if (!downloadUrl.startsWith('https://')) {
      // If no protocol, add https
      secureUrl = 'https://' + downloadUrl;
    }
    
    console.log('Opening download URL:', secureUrl);
    window.open(secureUrl, '_blank');
    
    return { success: true, filename: 'downloaded-file.pdf' };
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
    const result = await uploadFiles(API_ENDPOINTS.POWERPOINT_TO_PDF, formData);
    // ✅ Double ensure HTTPS
    result.downloadUrl = forceHttps(result.downloadUrl);
    return result;
  },

  // Word to PDF
  convertWordToPdf: async (file) => {
    const formData = new FormData();
    formData.append('word', file);
    const result = await uploadFiles(API_ENDPOINTS.WORD_TO_PDF, formData);
    result.downloadUrl = forceHttps(result.downloadUrl);
    return result;
  },

  // Images to PDF
  convertImagesToPdf: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    const result = await uploadFiles(API_ENDPOINTS.IMAGES_TO_PDF, formData);
    result.downloadUrl = forceHttps(result.downloadUrl);
    return result;
  },

  // PDF to JPG
  convertPdfToJpg: async (file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    const result = await uploadFiles(API_ENDPOINTS.PDF_TO_JPG, formData);
    result.downloadUrl = forceHttps(result.downloadUrl);
    return result;
  },

  // Merge PDF
  mergePdfs: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('pdfs', file);
    });
    const result = await uploadFiles(API_ENDPOINTS.MERGE_PDF, formData);
    result.downloadUrl = forceHttps(result.downloadUrl);
    return result;
  },

  // Remove Pages
  removePages: async (file, pages) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('pages', pages);
    const result = await uploadFiles(API_ENDPOINTS.REMOVE_PAGES, formData);
    result.downloadUrl = forceHttps(result.downloadUrl);
    return result;
  },

  // Split PDF
  splitPdf: async (file, splitType, splitPoints = null, pageRanges = null) => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('splitType', splitType);
    
    if (splitPoints) {
      formData.append('splitPoints', splitPoints);
    }
    
    if (pageRanges) {
      formData.append('pageRanges', pageRanges);
    }
    
    const result = await uploadFiles(API_ENDPOINTS.SPLIT_PDF, formData);
    result.downloadUrl = forceHttps(result.downloadUrl);
    return result;
  },

  // Download file
  downloadFile,

  // Health check
  checkHealth
};