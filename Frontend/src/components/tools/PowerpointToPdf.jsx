// components/tools/PowerpointToPdf.jsx
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { API_ENDPOINTS, uploadFiles } from '../../utils/api';

const PowerpointToPdf = () => {
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [conversionType, setConversionType] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.openxmlformats-officedocument.presentationml.slideshow': ['.ppsx']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setError('');
    }
  });

  const convertToPdf = async () => {
    if (!file) {
      setError('Please select a PowerPoint file');
      return;
    }

    setIsConverting(true);
    setError('');
    setConversionType('');

    const formData = new FormData();
    formData.append('powerpoint', file);

    try {
      const result = await uploadFiles(API_ENDPOINTS.POWERPOINT_TO_PDF, formData);

      if (result.success) {
        // Use the full URL from backend response (no hardcoded localhost)
        setDownloadUrl(result.downloadUrl);
        setConversionType(result.conversionType);
      } else {
        setError(result.error || 'Conversion failed');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setIsConverting(false);
    }
  };

  const resetConverter = () => {
    setFile(null);
    setDownloadUrl('');
    setError('');
    setConversionType('');
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;
    
    try {
      const response = await fetch(downloadUrl, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `converted-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Download failed: ' + error.message);
    }
  };

  const getConversionBadge = () => {
    if (!conversionType) return null;
    
    const badges = {
      'soffice': { text: 'Full Content Conversion', color: 'bg-green-100 text-green-800 border-green-200' },
      'fallback': { text: 'Professional Format', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    };
    
    const badge = badges[conversionType] || badges.fallback;
    
    return (
      <div className={`badge ${badge.color} border ml-2`}>
        {badge.text}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">📊📄</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">PowerPoint to PDF Converter</h1>
          <p className="text-xl text-gray-600">
            Convert your presentations to professional PDF documents
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Upload */}
          <div className="space-y-6">
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-4xl mb-4">📁</div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Drop PowerPoint here' : 'Drag & drop PowerPoint here'}
              </p>
              <p className="text-gray-500 mb-4">or</p>
              <button className="btn bg-orange-600 hover:bg-orange-700 border-orange-600 text-white">
                Browse PowerPoint File
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Supports: .ppt, .pptx, .ppsx • Max 100MB
              </p>
            </div>

            {/* Selected File */}
            {file && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Selected Presentation
                </h3>
                <div className="flex items-center justify-between bg-white p-3 rounded border">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📊</div>
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="btn btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Convert Button */}
            {file && !downloadUrl && (
              <button
                onClick={convertToPdf}
                disabled={isConverting}
                className={`w-full btn btn-lg ${
                  isConverting
                    ? 'btn-disabled bg-gray-400'
                    : 'bg-orange-600 hover:bg-orange-700 border-orange-600 text-white'
                }`}
              >
                {isConverting ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Converting Presentation...
                  </>
                ) : (
                  'Convert to PDF'
                )}
              </button>
            )}
          </div>

          {/* Right Side - Preview/Result */}
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="alert alert-error">
                <span>❌</span>
                <span>{error}</span>
              </div>
            )}

            {/* Download Section */}
            {downloadUrl && (
              <div className="card bg-green-50 border-green-200">
                <div className="card-body text-center">
                  <div className="text-4xl text-green-600 mb-4">✅</div>
                  <div className="flex items-center justify-center mb-2">
                    <h3 className="card-title text-green-800">
                      Conversion Successful!
                    </h3>
                    {getConversionBadge()}
                  </div>
                  <p className="text-green-700 mb-2">
                    Your PowerPoint has been converted to PDF
                  </p>
                  <p className="text-sm text-green-600 mb-4">
                    {conversionType === 'soffice' 
                      ? 'Full content conversion with all slides preserved'
                      : 'Professional format conversion ready for use'
                    }
                  </p>
                  <div className="card-actions justify-center">
                    <button
                      onClick={handleDownload}
                      className="btn bg-green-600 hover:bg-green-700 border-green-600 text-white"
                    >
                      📥 Download PDF
                    </button>
                    <button
                      onClick={resetConverter}
                      className="btn btn-outline border-gray-400 text-gray-700 hover:bg-gray-100"
                    >
                      Convert Another
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            {!downloadUrl && !file && (
              <div className="card bg-orange-50 border-orange-200">
                <div className="card-body">
                  <h3 className="card-title text-orange-800">How to use:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-orange-700">
                    <li>Upload your PowerPoint file (.ppt or .pptx)</li>
                    <li>Click "Convert to PDF" button</li>
                    <li>Download your converted PDF file</li>
                    <li>All slides, layouts, and designs are preserved</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Processing Info */}
            {isConverting && (
              <div className="card bg-blue-50 border-blue-200">
                <div className="card-body text-center">
                  <span className="loading loading-spinner loading-lg text-blue-600"></span>
                  <p className="text-blue-700 mt-2 font-semibold">
                    Converting PowerPoint to PDF...
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    Processing slides and preserving formatting
                  </p>
                  <p className="text-blue-500 text-xs mt-2">
                    This may take a few moments for larger presentations
                  </p>
                </div>
              </div>
            )}

            {/* Features */}
            {!downloadUrl && (
              <div className="card bg-gray-50 border-gray-200">
                <div className="card-body">
                  <h3 className="card-title text-gray-800">Features:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Preserves all slides and layouts
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Maintains image quality and formatting
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Professional PDF output
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Compatible with all PDF viewers
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerpointToPdf;