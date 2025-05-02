
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If there are specific allowed roles and the user doesn't have the required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to dashboard if they don't have permission
    return <Navigate to="/dashboard" replace />;
  }

  // Render the protected component
  return <>{children}</>;
};

export default PrivateRoute;
