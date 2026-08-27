import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false }) => {
  const { user, loading } = useAuth();

  // Wait for initial auth check (/api/auth/me) to finish
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Poppins, sans-serif' }}>
        Loading...
      </div>
    );
  }

  // If user is not authenticated at all -> redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // STRICT CHECK: If page is admin-only, user MUST have role === 'admin' in database!
  // If their role is 'user' (even if email is admin@gmail.com), they CANNOT access /admin
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;