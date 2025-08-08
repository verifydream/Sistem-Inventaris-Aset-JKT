import React, { createContext, useState, useContext, useEffect } from 'react';

const AdminModeContext = createContext();

export const useAdminMode = () => useContext(AdminModeContext);

export const AdminModeProvider = ({ children }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  // Check localStorage on initial load
  useEffect(() => {
    const storedAdminMode = localStorage.getItem('adminMode');
    if (storedAdminMode === 'true') {
      setIsAdminMode(true);
    }
  }, []);
  
  // Function to enter admin mode
  const enterAdminMode = (password) => {
    if (password === 'admin123') {
      setIsAdminMode(true);
      localStorage.setItem('adminMode', 'true');
      return true;
    }
    return false;
  };
  
  // Function to exit admin mode
  const exitAdminMode = () => {
    setIsAdminMode(false);
    localStorage.removeItem('adminMode');
  };
  
  return (
    <AdminModeContext.Provider value={{ isAdminMode, enterAdminMode, exitAdminMode }}>
      {children}
    </AdminModeContext.Provider>
  );
};