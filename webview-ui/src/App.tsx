import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// import page
import Index from '@/pages/Index';
import History from '@/pages/History';
import AdvancedSettingsPage from './pages/Setting';

// import components
import { TooltipProvider } from '@/components/ui/tooltip';
import { ChatProvider } from "@/context/ChatContext";


const App: React.FC = () => {
  return (
    <TooltipProvider>
      <ChatProvider>
        <Router>
          <Routes>
            <Route path="*" element={<Index />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<AdvancedSettingsPage />}/>
          </Routes>
        </Router>
      </ChatProvider>
    </TooltipProvider>
  );
};

export default App;
