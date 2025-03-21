import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    // Redirect to unauthorized if role is not allowed
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;