import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-coffee-50 flex flex-col items-center justify-center">
        {/* Stylish Coffee Cup Loader */}
        <div className="relative w-16 h-16 border-4 border-coffee-200 border-t-coffee-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-coffee-800 font-semibold animate-pulse">Brewing your experience...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page and store the original path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user's role is not authorized, redirect to their default home dashboards
    if (user.role === 'owner') {
      return <Navigate to="/owner-dashboard" replace />;
    } else if (user.role === 'supplier') {
      return <Navigate to="/supplier-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
