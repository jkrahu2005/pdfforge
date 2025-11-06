// components/layout/Header.jsx
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="navbar max-w-7xl mx-auto px-4">
        <div className="navbar-start">
          <Link to="/" className="btn btn-ghost text-xl">
            <span className="text-blue-600">🗂️</span>
            <span className="text-gray-800 font-bold ml-2">PDFMaster</span>
          </Link>
        </div>
        
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li><Link to="/" className="font-medium text-gray-700 hover:text-blue-600">Home</Link></li>
            <li>
              <details>
                <summary className="font-medium text-gray-700 hover:text-blue-600">PDF Tools</summary>
                <ul className="p-2 bg-white rounded-box shadow-lg border border-gray-200 w-48">
                  <li><Link to="/tools/jpg-to-pdf" className="text-gray-700 hover:text-blue-600">JPG to PDF</Link></li>
                  <li><Link to="/tools/pdf-to-jpg" className="text-gray-700 hover:text-blue-600">PDF to JPG</Link></li>
                  <li><Link to="/tools/word-to-pdf" className="text-gray-700 hover:text-blue-600">WORD to PDF</Link></li>
                   <li><Link to="/tools/powerpoint-to-pdf" className="text-gray-700 hover:text-blue-600">PowerPoint to PDF</Link></li>
                  {/* Add more tools as we build them */}
                  <li><a className="text-gray-500 hover:text-gray-500 cursor-not-allowed">Compress PDF</a></li>
                  <li><a className="text-gray-500 hover:text-gray-500 cursor-not-allowed">Merge PDF</a></li>
                  <li><a className="text-gray-500 hover:text-gray-500 cursor-not-allowed">Split PDF</a></li>
                </ul>
              </details>
            </li>
            <li><Link to="/about" className="font-medium text-gray-700 hover:text-blue-600">About</Link></li>
          </ul>
        </div>
        
        <div className="navbar-end">
          <Link to="/tools/jpg-to-pdf" className="btn bg-blue-600 hover:bg-blue-700 border-blue-600 text-white btn-sm">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;