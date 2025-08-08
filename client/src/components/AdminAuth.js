import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminMode } from '../context/AdminModeContext';

const AdminAuth = ({ children }) => {
  const { isAdminMode } = useAdminMode();
  
  if (!isAdminMode) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AdminAuth;