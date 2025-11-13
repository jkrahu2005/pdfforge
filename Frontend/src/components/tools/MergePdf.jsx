// frontend/src/components/tools/MergePdf.jsx
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../../utils/api';

const MergePdf = () => {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');
  const [mergeResult, setMergeResult] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 20,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0].code === 'file-too-large') {
          setError('File too large. Maximum size is 50MB per file.');
        } else if (rejection.errors[0].code === 'too-many-files') {
          setError('Too many files. Maximum 20 files allowed.');
        } else {
          setError('Invalid file type. Please upload PDF files only.');
        }
        return;
      }
      
      setFiles(prev => [...prev, ...acceptedFiles]);
      setError('');
    }
  });

  const mergePdfs = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge');
      return;
    }

    setIsMerging(true);
    setError('');

    try {
      const result = await api.mergePdfs(files);

      if (result.success) {
        setDownloadUrl(result.downloadUrl);
        setMergeResult(result);
      } else {
        setError(result.error || 'Merge failed');
      }
    } catch (error) {
      setError('Network error: ' + error.message);
    } finally {
      setIsMerging(false);
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
    setMergeResult(null);
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
      a.download = `merged-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError('Download failed: ' + error.message);
    }
  };

  const moveFile = (index, direction) => {
    const newFiles = [...files];
    if (direction === 'up' && index > 0) {
      [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
    } else if (direction === 'down' && index < newFiles.length - 1) {
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    }
    setFiles(newFiles);
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">🔀📄</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Merge PDF</h1>
          <p className="text-xl text-gray-600">
            Combine multiple PDF files into one document
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
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-4xl mb-4">📁</div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Drop PDFs here' : 'Drag & drop PDF files here'}
              </p>
              <p className="text-gray-500 mb-4">or</p>
              <button className="btn bg-purple-600 hover:bg-purple-700 border-purple-600 text-white">
                Browse PDF Files
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Supports: PDF • Max 20 files, 50MB each
              </p>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">
                    Selected Files ({files.length})
                  </h3>
                  <span className="text-sm text-gray-600">
                    Drag to reorder or use arrows
                  </span>
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-3 rounded border hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="text-2xl">📄</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => moveFile(index, 'up')}
                          disabled={index === 0}
                          className={`btn btn-ghost btn-sm ${index === 0 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveFile(index, 'down')}
                          disabled={index === files.length - 1}
                          className={`btn btn-ghost btn-sm ${index === files.length - 1 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeFile(index)}
                          className="btn btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Merge Button */}
            {files.length > 0 && !downloadUrl && (
              <button
                onClick={mergePdfs}
                disabled={isMerging || files.length < 2}
                className={`w-full btn btn-lg ${
                  isMerging || files.length < 2
                    ? 'btn-disabled bg-gray-400'
                    : 'bg-purple-600 hover:bg-purple-700 border-purple-600 text-white'
                }`}
              >
                {isMerging ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Merging {files.length} PDFs...
                  </>
                ) : (
                  `Merge ${files.length} PDFs`
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
            {downloadUrl && mergeResult && (
              <div className="card bg-green-50 border-green-200">
                <div className="card-body text-center">
                  <div className="text-4xl text-green-600 mb-4">✅</div>
                  <h3 className="card-title text-green-800 justify-center">
                    Merge Successful!
                  </h3>
                  
                  {/* Merge Summary */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Total Files:</span>
                        <span className="ml-2">{mergeResult.mergeResult.totalFiles}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Total Pages:</span>
                        <span className="ml-2">{mergeResult.mergeResult.totalPages}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Output Size:</span>
                        <span className="ml-2">
                          {(mergeResult.mergeResult.outputFileSize / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-green-700 mb-2">
                    Your PDFs have been merged successfully
                  </p>
                  
                  <div className="card-actions justify-center">
                    <button
                      onClick={handleDownload}
                      className="btn bg-green-600 hover:bg-green-700 border-green-600 text-white"
                    >
                      📥 Download Merged PDF
                    </button>
                    <button
                      onClick={resetConverter}
                      className="btn btn-outline border-gray-400 text-gray-700 hover:bg-gray-100"
                    >
                      Merge More PDFs
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            {!downloadUrl && files.length === 0 && (
              <div className="card bg-purple-50 border-purple-200">
                <div className="card-body">
                  <h3 className="card-title text-purple-800">How to use:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-purple-700">
                    <li>Upload 2 or more PDF files (up to 20)</li>
                    <li>Reorder files using up/down arrows if needed</li>
                    <li>Click "Merge PDFs" button</li>
                    <li>Download your merged PDF file</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Processing Info */}
            {isMerging && (
              <div className="card bg-blue-50 border-blue-200">
                <div className="card-body text-center">
                  <span className="loading loading-spinner loading-lg text-blue-600"></span>
                  <p className="text-blue-700 mt-2 font-semibold">
                    Merging {files.length} PDF files...
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
                      Merge up to 20 PDF files
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      Reorder files before merging
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

export default MergePdf;