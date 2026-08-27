import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Authentication from './pages/Authentication/Authentication';
import Home from './pages/Home/Home';
import Admin from './pages/Admin/Admin';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Authentication defaultIsSignUp={false} />} />
        <Route path="/register" element={<Authentication defaultIsSignUp={true} />} />

        {/* Protected Home Route (Regular & Admin users) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<Home />} />
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