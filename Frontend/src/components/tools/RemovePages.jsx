// frontend/src/components/tools/RemovePages.jsx
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../../utils/api';

const RemovePages = () => {
  const [file, setFile] = useState(null);
  const [pagesInput, setPagesInput] = useState('');
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
      setPagesInput('');
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

  const removePages = async () => {
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    if (!pagesInput.trim()) {
      setError('Please specify which pages to remove');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await api.removePages(file, pagesInput.trim());

      if (response.success) {
        setDownloadUrl(response.downloadUrl);
        setResult(response);
      } else {
        setError(response.error || 'Page removal failed');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetConverter = () => {
    setFile(null);
    setPagesInput('');
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
      a.download = `pages-removed-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Download failed: ' + error.message);
    }
  };

  const addPageToInput = (pageNumber) => {
    const currentPages = pagesInput.split(',').map(p => p.trim()).filter(p => p);
    
    if (!currentPages.includes(pageNumber.toString())) {
      const newPages = [...currentPages, pageNumber.toString()];
      setPagesInput(newPages.join(', '));
    }
  };

  const clearPagesInput = () => {
    setPagesInput('');
  };

  const getPagePreview = () => {
    if (!pageCount) return [];
    
    const pages = [];
    for (let i = 1; i <= pageCount; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">🗑️📄</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Remove PDF Pages</h1>
          <p className="text-xl text-gray-600">
            Delete unwanted pages from your PDF document
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
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-4xl mb-4">📁</div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Drop PDF here' : 'Drag & drop PDF file here'}
              </p>
              <p className="text-gray-500 mb-4">or</p>
              <button className="btn bg-red-600 hover:bg-red-700 border-red-600 text-white">
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

            {/* Pages Input */}
            {file && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">
                    Pages to Remove
                  </h3>
                  <button
                    onClick={clearPagesInput}
                    className="btn btn-ghost btn-sm text-gray-600 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    value={pagesInput}
                    onChange={(e) => setPagesInput(e.target.value)}
                    placeholder="Example: 1, 3, 5-8, 10"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  
                  <div className="text-sm text-gray-600">
                    <p>Format examples:</p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Single pages: <code>1, 3, 5</code></li>
                      <li>Page ranges: <code>2-5</code></li>
                      <li>Mixed: <code>1, 3, 5-8, 10</code></li>
                    </ul>
                  </div>

                  {/* Quick Select Buttons */}
                  {pageCount > 0 && pageCount <= 20 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Quick select:</p>
                      <div className="flex flex-wrap gap-2">
                        {getPagePreview().map(page => (
                          <button
                            key={page}
                            onClick={() => addPageToInput(page)}
                            className={`btn btn-sm ${
                              pagesInput.includes(page.toString()) 
                                ? 'bg-red-600 text-white' 
                                : 'btn-outline border-gray-300 text-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Process Button */}
            {file && pagesInput && !downloadUrl && (
              <button
                onClick={removePages}
                disabled={isProcessing}
                className={`w-full btn btn-lg ${
                  isProcessing
                    ? 'btn-disabled bg-gray-400'
                    : 'bg-red-600 hover:bg-red-700 border-red-600 text-white'
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Removing Pages...
                  </>
                ) : (
                  'Remove Pages'
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
                    Pages Removed Successfully!
                  </h3>
                  
                  {/* Removal Summary */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Original Pages:</span>
                        <span className="ml-2">{result.fileInfo.originalPages}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Pages Removed:</span>
                        <span className="ml-2">{result.removalResult.removedCount}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Remaining Pages:</span>
                        <span className="ml-2">{result.removalResult.remainingCount}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Removed Pages:</span>
                        <span className="ml-2">[{result.removalResult.removedPages.join(', ')}]</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-green-700 mb-2">
                    Selected pages have been removed from your PDF
                  </p>
                  
                  <div className="card-actions justify-center">
                    <button
                      onClick={handleDownload}
                      className="btn bg-green-600 hover:bg-green-700 border-green-600 text-white"
                    >
                      📥 Download Modified PDF
                    </button>
                    <button
                      onClick={resetConverter}
                      className="btn btn-outline border-gray-400 text-gray-700 hover:bg-gray-100"
                    >
                      Remove More Pages
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            {!downloadUrl && !file && (
              <div className="card bg-red-50 border-red-200">
                <div className="card-body">
                  <h3 className="card-title text-red-800">How to use:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-red-700">
                    <li>Upload a PDF file</li>
                    <li>Specify which pages to remove using numbers and ranges</li>
                    <li>Click "Remove Pages" button</li>
                    <li>Download your modified PDF file</li>
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
                    Removing pages from PDF...
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    Processing your document
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
                      Remove single or multiple pages
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Support for page ranges (e.g., 2-5)
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Preserve original quality
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Fast and secure processing
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

export default RemovePages;