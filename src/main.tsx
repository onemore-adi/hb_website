import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './style.css';
import { App } from './App';

// Lazy load route components - only load when user navigates to them
const JoinUs = lazy(() => import('./components/JoinUs').then(m => ({ default: m.JoinUs })));
const UserDashboard = lazy(() => import('./components/UserDashboard').then(m => ({ default: m.UserDashboard })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then(m => ({ default: m.AdminPanel })));
const BandMemberArea = lazy(() => import('./components/BandMemberArea').then(m => ({ default: m.BandMemberArea })));
const ApplicationsList = lazy(() => import('./components/ApplicationsList').then(m => ({ default: m.ApplicationsList })));
const ApplicationDetail = lazy(() => import('./components/ApplicationDetail').then(m => ({ default: m.ApplicationDetail })));
const Chat = lazy(() => import('./components/Chat').then(m => ({ default: m.Chat })));
const MembersList = lazy(() => import('./components/MembersList').then(m => ({ default: m.MembersList })));

// Loading fallback for route transitions
const RouteLoader = () => (
  <div style={{
    minHeight: '100vh',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontFamily: 'Inter, sans-serif'
  }}>
    Loading...
  </div>
);

// Get the root element
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

// Create root and render the app with routing
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/join" element={<JoinUs />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/band-area" element={<BandMemberArea />} />
            <Route path="/applications" element={<ApplicationsList />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/members" element={<MembersList />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);