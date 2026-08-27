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

  // If page is admin-only and user is NOT admin -> strictly redirect to /home
  if (adminOnly && user.role !== 'admin' && user.email !== 'admin@gmail.com') {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;