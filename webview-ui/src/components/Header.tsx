import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-100 border-b border-gray-300">
      <div className="text-xl font-bold">RAGGIN</div>
      <div className="flex gap-4">
        <Link 
          to="/config" 
          className="px-3 py-1 bg-red-50 text-black rounded-xl hover:bg-red-100 transition-colors"
        >
          Config
        </Link>
        <Link 
          to="/history" 
          className="px-3 py-1 bg-red-50 text-black rounded-xl hover:bg-red-100 transition-colors"
        >
          History
        </Link>
      </div>
    </header>
  );
};

export default Header;
