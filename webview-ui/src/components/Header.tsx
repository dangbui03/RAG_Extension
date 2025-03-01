import React from 'react';
import { Link } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';  // Import Font Awesome CSS

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center p-2 bg-gray-100 border-b border-gray-300">
      <Link to="/" className="p-2 text-xl font-bold">
        RAGGIN
      </Link>
      <div className="flex gap-2 sm:gap-4">
        <Link 
          to="/config" 
          className="p-2 text-black rounded-xl hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
        >
          <i className="fa fa-cogs"></i> {/* Config Icon */}
        </Link>
        <Link 
          to="/history" 
          className="p-2 text-black rounded-xl hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
        >
          <i className="fa fa-history"></i> {/* History Icon */}
        </Link>
      </div>
    </header>
  );
};

export default Header;
