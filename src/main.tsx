import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './App';
import { JoinUs } from './components/JoinUs';

// Get the root element
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

// Create root and render the app with routing
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/join" element={<JoinUs />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);