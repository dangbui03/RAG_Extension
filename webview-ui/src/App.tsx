import React from 'react'; //, { useEffect, useState, useRef }
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Config from './components/Config';
import HistoryView from './components/history/HistoryView';
import Index from './pages/Index';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/config" element={<Config />} />
        <Route path="/history" element={<HistoryView />} />
        <Route path="*" element={<Index />} />
      </Routes>
    </Router>
  );
};

export default App;
