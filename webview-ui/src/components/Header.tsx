import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center p-2 bg-vscode-panel-border text-white">
      <Link to="/" className="p-2 text-xl font-bold">
        RAGGIN
      </Link>
      <div className="flex gap-2 sm:gap-4">
        <Link 
          to="/config" 
          className="codicon codicon-settings-gear p-2 text-white rounded-xl hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
        >
          a
        </Link>
        <Link 
          to="/history" 
          className="codicon codicon-history p-2 text-white rounded-xl hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
        >
          b
        </Link>
      </div>
    </header>
  );
};

export default Header;
