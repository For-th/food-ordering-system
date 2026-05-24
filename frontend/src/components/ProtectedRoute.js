import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const isAdmin = localStorage.getItem('isAdmin');

  if (!isAdmin) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;