import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './tailwind.css';  // We'll configure Tailwind next

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}