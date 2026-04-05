import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { NotificationProvider } from './components/NotificationToast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Results from './pages/Results';
import Chat from './pages/Chat';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {children}
    </motion.div>
  ) : (
    <Navigate to="/login" replace />
  );
};

const App = () => {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  if (!googleClientId) {
    console.warn('Google Client ID not configured. Google login will not work.');
  }

  return (
    <NotificationProvider>
      <GoogleOAuthProvider clientId={googleClientId || ''}>
        <div className="min-h-screen bg-dark-950">
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/results"
                element={
                  <ProtectedRoute>
                    <Results />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat/:requestId"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </div>
      </GoogleOAuthProvider>
    </NotificationProvider>
  );
};

export default App;
