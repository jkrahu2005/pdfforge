// frontend/src/components/tools/SplitPdf.jsx
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../../utils/api';

const SplitPdf = () => {
  const [file, setFile] = useState(null);
  const [splitType, setSplitType] = useState('split-at-pages');
  const [splitPoints, setSplitPoints] = useState('');
  const [pageRanges, setPageRanges] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [pageCount, setPageCount] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      setError('');
      setSplitPoints('');
      setPageRanges('');
      setPageCount(0);
      
      // Try to get page count from file (this is just for UI, actual validation happens on backend)
      if (acceptedFiles[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            // This is a simple estimation - actual page count will be validated by backend
            const arrayBuffer = e.target.result;
            const uint8Array = new Uint8Array(arrayBuffer);
            const pdfText = new TextDecoder().decode(uint8Array);
            
            // Count "/Type/Page" occurrences as a rough estimate
            const pageMatches = pdfText.match(/\/Type\s*\/Page\b/g);
            const estimatedPages = pageMatches ? pageMatches.length : 1;
            setPageCount(estimatedPages);
          } catch (err) {
            console.log('Could not estimate page count');
          }
        };
        reader.readAsArrayBuffer(acceptedFiles[0]);
      }
    }
  });

  const splitPdf = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await api.splitPdf(file, splitType, splitPoints, pageRanges);

      if (response.success) {
        setDownloadUrl(response.downloadUrl);
        setResult(response);
      } else {
        setError(response.error || 'Split failed');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetConverter = () => {
    setFile(null);
    setSplitType('split-at-pages');
    setSplitPoints('');
    setPageRanges('');
    setDownloadUrl('');
    setError('');
    setResult(null);
    setPageCount(0);
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
      a.download = `split-pdf-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Download failed: ' + error.message);
    }
  };

  const renderSplitOptions = () => {
    switch (splitType) {
      case 'split-at-pages':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Split After Pages
              </label>
              <input
                type="text"
                value={splitPoints}
                onChange={(e) => setSplitPoints(e.target.value)}
                placeholder="Example: 2,5 (split after pages 2 and 5)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter page numbers where you want to split (e.g., 2,5 will create 3 files: 1-2, 3-5, 6-end)
              </p>
            </div>
          </div>
        );

      case 'extract-ranges':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Ranges to Extract
              </label>
              <input
                type="text"
                value={pageRanges}
                onChange={(e) => setPageRanges(e.target.value)}
                placeholder="Example: 1-3,5-8,10"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Specify page ranges to extract (e.g., 1-3,5-8 will create files for pages 1-3 and 5-8)
              </p>
            </div>
          </div>
        );

      case 'split-individual':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-blue-600 text-lg mr-3">ℹ️</div>
              <div>
                <p className="text-blue-800 font-medium">Individual Page Split</p>
                <p className="text-blue-700 text-sm">
                  Each page will be saved as a separate PDF file. {pageCount > 0 && `This will create ${pageCount} files.`}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getSplitTypeDescription = () => {
    switch (splitType) {
      case 'split-at-pages':
        return 'Split the PDF into multiple files at specific page numbers';
      case 'extract-ranges':
        return 'Extract specific page ranges into separate PDF files';
      case 'split-individual':
        return 'Split each page into individual PDF files';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">✂️📄</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Split PDF</h1>
          <p className="text-xl text-gray-600">
            Split PDF into multiple files or extract specific pages
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Upload & Configuration */}
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
                {isDragActive ? 'Drop PDF here' : 'Drag & drop PDF file here'}
              </p>
              <p className="text-gray-500 mb-4">or</p>
              <button className="btn bg-orange-600 hover:bg-orange-700 border-orange-600 text-white">
                Browse PDF File
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Supports: PDF • Max 50MB
              </p>
            </div>

            {/* Selected File */}
            {file && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Selected PDF
                </h3>
                <div className="flex items-center justify-between bg-white p-3 rounded border">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📄</div>
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                        {pageCount > 0 && ` • ${pageCount} pages`}
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

            {/* Split Type Selection */}
            {file && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Split Options
                </h3>
                
                <div className="space-y-4">
                  {/* Split Type Radio Buttons */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Split Method
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'split-at-pages', label: 'Split at Specific Pages', icon: '📍' },
                        { value: 'extract-ranges', label: 'Extract Page Ranges', icon: '📑' },
                        { value: 'split-individual', label: 'Split into Individual Pages', icon: '📄' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            value={option.value}
                            checked={splitType === option.value}
                            onChange={(e) => setSplitType(e.target.value)}
                            className="radio radio-primary"
                          />
                          <span className="text-lg">{option.icon}</span>
                          <span className="text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-2">
                      {getSplitTypeDescription()}
                    </p>
                  </div>

                  {/* Dynamic Split Options */}
                  {renderSplitOptions()}
                </div>
              </div>
            )}

            {/* Process Button */}
            {file && !downloadUrl && (
              <button
                onClick={splitPdf}
                disabled={isProcessing || 
                  (splitType === 'split-at-pages' && !splitPoints) ||
                  (splitType === 'extract-ranges' && !pageRanges)
                }
                className={`w-full btn btn-lg ${
                  isProcessing
                    ? 'btn-disabled bg-gray-400'
                    : 'bg-orange-600 hover:bg-orange-700 border-orange-600 text-white'
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Splitting PDF...
                  </>
                ) : (
                  `Split PDF`
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
            {downloadUrl && result && (
              <div className="card bg-green-50 border-green-200">
                <div className="card-body text-center">
                  <div className="text-4xl text-green-600 mb-4">✅</div>
                  <h3 className="card-title text-green-800 justify-center">
                    PDF Split Successfully!
                  </h3>
                  
                  {/* Split Summary */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="font-semibold">Original Pages:</span>
                        <span className="ml-2">{result.fileInfo.originalPages}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Files Created:</span>
                        <span className="ml-2">{result.splitResult.totalFiles}</span>
                      </div>
                    </div>
                    
                    {/* File List */}
                    <div className="max-h-40 overflow-y-auto">
                      <p className="font-semibold text-gray-700 mb-2">Created Files:</p>
                      <ul className="space-y-1 text-left">
                        {result.splitResult.files.map((file, index) => (
                          <li key={index} className="text-sm text-gray-600 flex justify-between">
                            <span>{file.filename}</span>
                            <span className="text-gray-500">({file.pageCount} pages)</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-green-700 mb-2">
                    All files have been packaged into a ZIP file
                  </p>
                  
                  <div className="card-actions justify-center">
                    <button
                      onClick={handleDownload}
                      className="btn bg-green-600 hover:bg-green-700 border-green-600 text-white"
                    >
                      📥 Download ZIP File
                    </button>
                    <button
                      onClick={resetConverter}
                      className="btn btn-outline border-gray-400 text-gray-700 hover:bg-gray-100"
                    >
                      Split Another PDF
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
                    <li>Upload a PDF file</li>
                    <li>Choose your preferred split method</li>
                    <li>Configure the split options</li>
                    <li>Click "Split PDF" button</li>
                    <li>Download your split files as ZIP</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Processing Info */}
            {isProcessing && (
              <div className="card bg-blue-50 border-blue-200">
                <div className="card-body text-center">
                  <span className="loading loading-spinner loading-lg text-blue-600"></span>
                  <p className="text-blue-700 mt-2 font-semibold">
                    Splitting PDF document...
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    This may take a few moments
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
                      Split at specific page numbers
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Extract specific page ranges
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Split into individual pages
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Download all files as ZIP
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

export default SplitPdf;