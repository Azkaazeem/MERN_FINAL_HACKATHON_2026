import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Authentication from './pages/Authentication/Authentication';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Profile from './pages/Profile/Profile';
import Admin from './pages/Admin/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import CustomCursor from './components/CustomCursor/CustomCursor';
import Chatbot from './components/Chatbot/Chatbot';

function App() {
  return (
    <Router>
      {/* Global Smooth Custom Cursor */}
      <CustomCursor />

      {/* Floating AI Chatbot Widget */}
      <Chatbot />
      
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Authentication defaultIsSignUp={false} />} />
        <Route path="/register" element={<Authentication defaultIsSignUp={true} />} />

        {/* Protected Routes (Regular & Admin users) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Protected Admin Route (STRICTLY Admin Only) */}
        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* Default fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;