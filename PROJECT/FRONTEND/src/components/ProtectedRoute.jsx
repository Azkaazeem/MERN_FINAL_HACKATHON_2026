import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false, workerOnly = false, allowedRoles = null }) => {
  const { user, loading } = useAuth();

  // Wait for initial auth check
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        Loading...
      </div>
    );
  }

  // If user is not authenticated at all -> redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role checks (supports 'admin' and 'administrator')
  const role = (user.role || '').toLowerCase().trim();
  const isAdmin = role === 'admin' || role === 'administrator';
  const isWorker = role === 'worker' || role === 'agent' || role === 'field worker';

  if (adminOnly && !isAdmin) {
    return <Navigate to="/home" replace />;
  }

  if (workerOnly && !isWorker && !isAdmin) {
    return <Navigate to="/home" replace />;
  }

  if (allowedRoles) {
    const isAllowed = allowedRoles.some(r => {
      const nr = r.toLowerCase().trim();
      return nr === role || (nr === 'admin' && isAdmin) || (nr === 'worker' && isWorker);
    });
    if (!isAllowed) {
      return <Navigate to="/home" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;