import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Components
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import AssetDetail from './pages/AssetDetail';
import AssetForm from './pages/AssetForm';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import AdminAuth from './components/AdminAuth';

// Context
import { AdminModeProvider } from './context/AdminModeContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AdminModeProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminAuth><AdminDashboard /></AdminAuth>} />
            <Route path="/asset/:id" element={<AssetDetail />} />
            <Route path="/admin/asset/:action" element={<AdminAuth><AssetForm /></AdminAuth>} />
            <Route path="/admin/asset/:action/:id" element={<AdminAuth><AssetForm /></AdminAuth>} />
            <Route path="/admin/settings" element={<AdminAuth><Settings /></AdminAuth>} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
      </AdminModeProvider>
    </ThemeProvider>
  );
}

export default App;
