import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { App } from './App';
import { JoinUs } from './components/JoinUs';
import { UserDashboard } from './components/UserDashboard';
import { AdminPanel } from './components/AdminPanel';
import { BandMemberArea } from './components/BandMemberArea';

// Get the root element
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

// Create root and render the app with routing
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/join" element={<JoinUs />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/band-area" element={<BandMemberArea />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);