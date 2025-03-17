import React from 'react'; //, { useEffect, useState, useRef }
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

import Config from '@/components/Config';
import History from '@/pages/history';
import Index from '@/pages/Index';


const App: React.FC = () => {
  return (
    <TooltipProvider>
      <Router>
        <Routes>
          <Route path="*" element={<Index />} />
          <Route path="/config" element={<Config />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </Router>
    </TooltipProvider>
  );
};

export default App;
