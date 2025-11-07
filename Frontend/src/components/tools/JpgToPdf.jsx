// frontend/src/components/tools/JpgToPdf.jsx
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { API_ENDPOINTS, uploadFiles } from '../../utils/api';

const JpgToPdf = () => {
  const [files, setFiles] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp']
    },
    maxFiles: 20,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0].code === 'file-too-large') {
          setError('File too large. Maximum size is 10MB per file.');
        } else if (rejection.errors[0].code === 'too-many-files') {
          setError('Too many files. Maximum 20 files allowed.');
        } else {
          setError('Invalid file type. Please upload images only.');
        }
        return;
      }
      
      setFiles(acceptedFiles);
      setError('');
    }
  });

  const convertToPdf = async () => {
    if (files.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setIsConverting(true);
    setError('');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const result = await uploadFiles(API_ENDPOINTS.IMAGES_TO_PDF, formData);

      if (result.success) {
        // Use the full URL from backend response (no hardcoded localhost)
        setDownloadUrl(result.downloadUrl);
      } else {
        setError(result.error || 'Conversion failed');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setIsConverting(false);
    }
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const resetConverter = () => {
    setFiles([]);
    setDownloadUrl('');
    setError('');
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

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">🖼️📄</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">JPG to PDF Converter</h1>
          <p className="text-xl text-gray-600">
            Convert your images to PDF documents instantly
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
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-4xl mb-4">📁</div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
              </p>
              <p className="text-gray-500 mb-4">or</p>
              <button className="btn bg-blue-600 hover:bg-blue-700 border-blue-600 text-white">
                Browse Files
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Supports: JPG, PNG, WEBP, GIF, BMP • Max 20 files, 10MB each
              </p>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Selected Files ({files.length})
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-3 rounded border"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">🖼️</div>
                        <div>
                          <p className="font-medium text-gray-800">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="btn btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Convert Button */}
            {files.length > 0 && !downloadUrl && (
              <button
                onClick={convertToPdf}
                disabled={isConverting}
                className={`w-full btn btn-lg ${
                  isConverting
                    ? 'btn-disabled bg-gray-400'
                    : 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white'
                }`}
              >
                {isConverting ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Converting... ({files.length} images)
                  </>
                ) : (
                  `Convert to PDF (${files.length} images)`
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
                  <h3 className="card-title text-green-800 justify-center">
                    Conversion Successful!
                  </h3>
                  <p className="text-green-700 mb-2">
                    Your PDF is ready for download
                  </p>
                  <p className="text-sm text-green-600 mb-4">
                    {files.length} image(s) converted
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
                      Convert More
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            {!downloadUrl && files.length === 0 && (
              <div className="card bg-blue-50 border-blue-200">
                <div className="card-body">
                  <h3 className="card-title text-blue-800">How to use:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-blue-700">
                    <li>Drag and drop your images or click to browse</li>
                    <li>Select multiple images (up to 20)</li>
                    <li>Click "Convert to PDF" button</li>
                    <li>Download your converted PDF file</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Processing Info */}
            {isConverting && (
              <div className="card bg-yellow-50 border-yellow-200">
                <div className="card-body text-center">
                  <span className="loading loading-spinner loading-lg text-yellow-600"></span>
                  <p className="text-yellow-700 mt-2">
                    Processing your images... This may take a few seconds.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JpgToPdf;