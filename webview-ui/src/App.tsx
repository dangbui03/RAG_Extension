import React from 'react'; //, { useEffect, useState, useRef }
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';

// import page
import Config from '@/components/Config';
import Index from '@/pages/Index';
import History from '@/pages/History';

// import components
import { ChatProvider } from "@/context/ChatContext";


const App: React.FC = () => {
  return (
    <TooltipProvider>
      <ChatProvider>
        <Router>
          <Routes>
            <Route path="*" element={<Index />} />
            <Route path="/config" element={<Config />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </Router>
      </ChatProvider>
    </TooltipProvider>
  );
};

export default App;
