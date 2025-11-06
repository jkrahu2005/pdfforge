// components/tools/WordToPdf.jsx
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { API_ENDPOINTS, uploadFiles } from '../../utils/api';


const WordToPdf = () => {
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setError('');
    }
  });

 const convertToPdf = async () => {
  if (!file) {
    setError('Please select a Word document');
    return;
  }

  setIsConverting(true);
  setError('');

  const formData = new FormData();
  formData.append('word', file);

  try {
    const result = await uploadFiles(API_ENDPOINTS.WORD_TO_PDF, formData);

    if (result.success) {
      setDownloadUrl(`http://localhost:5001${result.downloadUrl}`);
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
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">📝📄</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">WORD to PDF Converter</h1>
          <p className="text-xl text-gray-600">
            Convert your Word documents to PDF format
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
                {isDragActive ? 'Drop Word document here' : 'Drag & drop Word document here'}
              </p>
              <p className="text-gray-500 mb-4">or</p>
              <button className="btn bg-blue-600 hover:bg-blue-700 border-blue-600 text-white">
                Browse Word File
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Supports: .doc, .docx • Max 50MB
              </p>
            </div>

            {/* Selected File */}
            {file && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Selected File
                </h3>
                <div className="flex items-center justify-between bg-white p-3 rounded border">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📝</div>
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
                    : 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white'
                }`}
              >
                {isConverting ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Converting to PDF...
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
                  <h3 className="card-title text-green-800 justify-center">
                    Conversion Successful!
                  </h3>
                  <p className="text-green-700 mb-2">
                    Your Word document has been converted to PDF
                  </p>
                  <p className="text-sm text-green-600 mb-4">
                    Ready for download
                  </p>
                  <div className="card-actions justify-center">
                    <a
                      href={downloadUrl}
                      download
                      className="btn bg-green-600 hover:bg-green-700 border-green-600 text-white"
                    >
                      📥 Download PDF
                    </a>
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
              <div className="card bg-blue-50 border-blue-200">
                <div className="card-body">
                  <h3 className="card-title text-blue-800">How to use:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-blue-700">
                    <li>Upload your Word document (.doc or .docx)</li>
                    <li>Click "Convert to PDF" button</li>
                    <li>Download your converted PDF file</li>
                    <li>Formatting and layout are preserved</li>
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
                    Converting Word document to PDF... This may take a few moments.
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

export default WordToPdf;