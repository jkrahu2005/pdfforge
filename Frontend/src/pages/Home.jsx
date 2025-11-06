// pages/Home.jsx
import { Link } from 'react-router-dom';

const Home = () => {
  // Organize PDF Tools
  const organizePdfTools = [
    {
      icon: "🔀",
      title: "Merge PDF",
      description: "Combine multiple PDF files into one document",
      badge: "Popular",
      color: "primary",
      path: "/tools/merge-pdf"
    },
    {
      icon: "✂️",
      title: "Split PDF",
      description: "Split PDF into multiple files or extract pages",
      badge: "Free",
      color: "primary",
      path: "/tools/split-pdf"
    },
    {
      icon: "🗑️",
      title: "Remove Pages",
      description: "Delete unwanted pages from your PDF",
      badge: "New",
      color: "primary",
      path: "/tools/remove-pages"
    },
    {
      icon: "📄",
      title: "Extract Pages",
      description: "Extract specific pages from PDF document",
      badge: "Free",
      color: "primary",
      path: "/tools/extract-pages"
    },
    {
      icon: "📑",
      title: "Organize PDF",
      description: "Rearrange and organize PDF pages",
      badge: "Free",
      color: "primary",
      path: "/tools/organize-pdf"
    },
    {
      icon: "📷",
      title: "Scan to PDF",
      description: "Convert scanned documents to PDF",
      badge: "New",
      color: "primary",
      path: "/tools/scan-to-pdf"
    }
  ];

  // Convert to PDF Tools
  const convertToPdfTools = [
    {
      icon: "🖼️",
      title: "JPG to PDF",
      description: "Convert images to PDF documents",
      badge: "Popular",
      color: "accent",
      path: "/tools/jpg-to-pdf"
    },
    {
      icon: "📝",
      title: "WORD to PDF",
      description: "Convert Word documents to PDF",
      badge: "Free",
      color: "accent",
      path: "/tools/word-to-pdf"
    },
    {
      icon: "📊",
      title: "POWERPOINT to PDF",
      description: "Convert presentations to PDF",
      badge: "Free",
      color: "accent",
      path: "/tools/powerpoint-to-pdf"
    },
    {
      icon: "📈",
      title: "EXCEL to PDF",
      description: "Convert spreadsheets to PDF",
      badge: "Free",
      color: "accent",
      path: "/tools/excel-to-pdf"
    },
    {
      icon: "🌐",
      title: "HTML to PDF",
      description: "Convert web pages to PDF",
      badge: "Free",
      color: "accent",
      path: "/tools/html-to-pdf"
    }
  ];

  // Convert from PDF Tools
  const convertFromPdfTools = [
    {
      icon: "🖼️",
      title: "PDF to JPG",
      description: "Convert PDF pages to images",
      badge: "Free",
      color: "info",
      path: "/tools/pdf-to-jpg"
    },
    {
      icon: "📝",
      title: "PDF to WORD",
      description: "Convert PDF to editable Word",
      badge: "Free",
      color: "info",
      path: "/tools/pdf-to-word"
    },
    {
      icon: "📊",
      title: "PDF to POWERPOINT",
      description: "Convert PDF to presentation",
      badge: "Pro",
      color: "info",
      path: "/tools/pdf-to-ppt"
    },
    {
      icon: "📈",
      title: "PDF to EXCEL",
      description: "Convert PDF to spreadsheet",
      badge: "Pro",
      color: "info",
      path: "/tools/pdf-to-excel"
    },
    {
      icon: "📄",
      title: "PDF to PDF/A",
      description: "Convert to archival PDF format",
      badge: "Free",
      color: "info",
      path: "/tools/pdf-to-pdfa"
    }
  ];

  // Optimize PDF Tools
  const optimizePdfTools = [
    {
      icon: "📦",
      title: "Compress PDF",
      description: "Reduce PDF file size",
      badge: "Popular",
      color: "secondary",
      path: "/tools/compress-pdf"
    },
    {
      icon: "🔧",
      title: "Repair PDF",
      description: "Fix corrupted PDF files",
      badge: "Free",
      color: "secondary",
      path: "/tools/repair-pdf"
    },
    {
      icon: "👁️",
      title: "OCR PDF",
      description: "Convert scanned PDF to searchable text",
      badge: "Pro",
      color: "secondary",
      path: "/tools/ocr-pdf"
    }
  ];

  // Edit PDF Tools
  const editPdfTools = [
    {
      icon: "🔄",
      title: "Rotate PDF",
      description: "Rotate PDF pages orientation",
      badge: "Free",
      color: "success",
      path: "/tools/rotate-pdf"
    },
    {
      icon: "🔢",
      title: "Add Page Numbers",
      description: "Add page numbers to PDF",
      badge: "Free",
      color: "success",
      path: "/tools/add-page-numbers"
    },
    {
      icon: "💧",
      title: "Add Watermark",
      description: "Add text or image watermarks",
      badge: "Free",
      color: "success",
      path: "/tools/add-watermark"
    },
    {
      icon: "✂️",
      title: "Crop PDF",
      description: "Crop PDF page margins",
      badge: "Free",
      color: "success",
      path: "/tools/crop-pdf"
    },
    {
      icon: "✏️",
      title: "Edit PDF",
      description: "Edit text and images in PDF",
      badge: "Pro",
      color: "success",
      path: "/tools/edit-pdf"
    },
    {
      icon: "📊",
      title: "Compare PDF",
      description: "Compare two PDF documents",
      badge: "Pro",
      color: "success",
      path: "/tools/compare-pdf"
    }
  ];

  // PDF Security Tools
  const pdfSecurityTools = [
    {
      icon: "🔓",
      title: "Unlock PDF",
      description: "Remove password protection",
      badge: "Pro",
      color: "warning",
      path: "/tools/unlock-pdf"
    },
    {
      icon: "🔒",
      title: "Protect PDF",
      description: "Add password protection",
      badge: "Free",
      color: "warning",
      path: "/tools/protect-pdf"
    },
    {
      icon: "✍️",
      title: "Sign PDF",
      description: "Add digital signatures",
      badge: "Free",
      color: "warning",
      path: "/tools/sign-pdf"
    },
    {
      icon: "⚫",
      title: "Redact PDF",
      description: "Permanently remove sensitive info",
      badge: "Pro",
      color: "warning",
      path: "/tools/redact-pdf"
    }
  ];

  // All tool categories
  const toolCategories = [
    {
      name: "ORGANIZE PDF",
      tools: organizePdfTools
    },
    {
      name: "OPTIMIZE PDF",
      tools: optimizePdfTools
    },
    {
      name: "CONVERT TO PDF", 
      tools: convertToPdfTools
    },
    {
      name: "CONVERT FROM PDF",
      tools: convertFromPdfTools
    },
    {
      name: "EDIT PDF",
      tools: editPdfTools
    },
    {
      name: "PDF SECURITY", 
      tools: pdfSecurityTools
    }
  ];

  const features = [
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Process files in seconds with our optimized tools"
    },
    {
      icon: "🔒", 
      title: "100% Secure",
      description: "Your files are automatically deleted after processing"
    },
    {
      icon: "💯",
      title: "Completely Free",
      description: "No hidden costs, no watermarks, no registration"
    },
    {
      icon: "🚀",
      title: "Easy to Use", 
      description: "Simple drag & drop interface for all tools"
    }
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <section className="hero bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold text-gray-800">
              Your Complete <span className="text-blue-600">PDF Solution</span>
            </h1>
            <p className="py-6 text-xl text-gray-600">
              Everything you need to work with PDFs - all in one place. 
              Convert, compress, edit, organize and secure your documents.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/tools/jpg-to-pdf" className="btn bg-blue-600 hover:bg-blue-700 border-blue-600 text-white btn-lg">
                Get Started Free
              </Link>
              <button className="btn btn-outline border-gray-400 text-gray-700 hover:bg-gray-100 btn-lg">
                View All Tools
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Organize PDF Section - Focused Development */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              <span className="text-blue-600">ORGANIZE PDF</span> Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Manage and organize your PDF documents with our powerful tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizePdfTools.map((tool, index) => (
              <Link 
                key={index} 
                to={tool.path}
                className="card bg-white shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-blue-500 hover:no-underline"
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl mb-2">{tool.icon}</div>
                    <div className={`badge ${
                      tool.badge === 'Popular' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      tool.badge === 'Free' ? 'bg-green-100 text-green-800 border-green-200' :
                      tool.badge === 'New' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                      'bg-orange-100 text-orange-800 border-orange-200'
                    } border`}>
                      {tool.badge}
                    </div>
                  </div>
                  <h3 className="card-title text-gray-800">{tool.title}</h3>
                  <p className="text-gray-600">{tool.description}</p>
                  <div className="card-actions justify-end">
                    <button className="btn bg-blue-600 hover:bg-blue-700 border-blue-600 text-white btn-sm">
                      Use Tool
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Tools Preview Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              All <span className="text-blue-600">PDF Tools</span> Available
            </h2>
            <p className="text-xl text-gray-600">
              Complete suite of PDF tools for all your needs
            </p>
          </div>

          <div className="space-y-12">
            {toolCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-300 pb-2">
                  {category.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {category.tools.map((tool, toolIndex) => (
                    <Link 
                      key={toolIndex} 
                      to={tool.path}
                      className="card bg-white shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300 hover:no-underline"
                    >
                      <div className="card-body p-4">
                        <div className="flex items-start justify-between">
                          <div className="text-2xl">{tool.icon}</div>
                          <div className={`badge badge-sm ${
                            tool.badge === 'Popular' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            tool.badge === 'Free' ? 'bg-green-100 text-green-800 border-green-200' :
                            tool.badge === 'New' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            'bg-orange-100 text-orange-800 border-orange-200'
                          } border`}>
                            {tool.badge}
                          </div>
                        </div>
                        <h4 className="card-title text-gray-800 text-lg">{tool.title}</h4>
                        <p className="text-gray-600 text-sm">{tool.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose <span className="text-blue-600">PDFMaster</span>?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4 text-blue-600">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Documents?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who trust PDFMaster for their document needs. 
            No registration required!
          </p>
          <Link to="/tools/jpg-to-pdf" className="btn bg-white text-blue-600 hover:bg-gray-100 border-white btn-lg">
            Start Converting Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;