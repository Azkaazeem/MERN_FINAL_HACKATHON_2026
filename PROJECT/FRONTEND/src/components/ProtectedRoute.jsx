import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false, workerOnly = false, allowedRoles = null }) => {
  const { user, loading } = useAuth();

  // Wait for initial auth check
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

  // Role checks
  const role = user.role?.toLowerCase() || 'customer';

  if (adminOnly && role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  if (workerOnly && role !== 'worker' && role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;