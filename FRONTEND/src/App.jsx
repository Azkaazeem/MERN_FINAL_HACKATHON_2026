import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Authentication from './pages/Authentication/Authentication';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route for Login -> passes defaultIsSignUp as false */}
        <Route path="/login" element={<Authentication defaultIsSignUp={false} />} />
        
        {/* Route for Register/Signup -> passes defaultIsSignUp as true */}
        <Route path="/register" element={<Authentication defaultIsSignUp={true} />} />
        
        {/* Default route redirects to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;