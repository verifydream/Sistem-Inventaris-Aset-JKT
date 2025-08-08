import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  useMediaQuery,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AssetCard from '../components/AssetCard';
import AssetFilter from '../components/AssetFilter';
import ReportGenerator from '../components/ReportGenerator';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { useAdminMode } from '../context/AdminModeContext';
import axios from 'axios';

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAdminMode } = useAdminMode();
  
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [assetsPerPage] = useState(8);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, assetId: null });
  const [qrDialog, setQrDialog] = useState({ open: false, assetId: null, assetName: '' });
  
  // Fetch assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Build query string
        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.condition) queryParams.append('condition', filters.condition);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/assets?${queryParams.toString()}`);
        setAssets(response.data);
        setTotalPages(Math.ceil(response.data.length / assetsPerPage));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assets:', error);
        setError('Gagal memuat data aset. Silakan coba lagi.');
        setLoading(false);
      }
    };
    
    fetchAssets();
  }, [filters, assetsPerPage]);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/assets/categories/list`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDeleteClick = (assetId) => {
    setDeleteDialog({ open: true, assetId });
  };
  
  const handleDeleteConfirm = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      await axios.delete(`${apiUrl}/api/assets/${deleteDialog.assetId}`);
      
      // Update assets list
      setAssets(assets.filter(asset => asset._id !== deleteDialog.assetId));
      setTotalPages(Math.ceil((assets.length - 1) / assetsPerPage));
      
      setDeleteDialog({ open: false, assetId: null });
    } catch (error) {
      console.error('Error deleting asset:', error);
      setError('Gagal menghapus aset. Silakan coba lagi.');
    }
  };
  
  const handleQrClick = (assetId, assetName) => {
    setQrDialog({ open: true, assetId, assetName });
  };
  
  // Get current assets for pagination
  const indexOfLastAsset = page * assetsPerPage;
  const indexOfFirstAsset = indexOfLastAsset - assetsPerPage;
  const currentAssets = assets.slice(indexOfFirstAsset, indexOfLastAsset);
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Box 
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: { xs: 6, md: 10 },
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } 
            }}
          >
            Sistem Inventaris Aset JKT
          </Typography>
          <Typography 
            variant="h6" 
            component="p"
            sx={{ 
              maxWidth: 600,
              mb: 4,
              opacity: 0.9,
              fontSize: { xs: '1rem', md: '1.25rem' } 
            }}
          >
            Kelola dan pantau semua aset perusahaan dengan mudah dan efisien.
          </Typography>
          
          {isAdminMode ? (
            <Button 
              variant="contained" 
              color="secondary"
              size="large"
              href="/admin/dashboard"
              sx={{ fontWeight: 'bold' }}
            >
              Buka Dashboard Admin
            </Button>
          ) : null}
        </Container>
      </Box>
      
      <Container maxWidth="lg" sx={{ mb: 4, flexGrow: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          mb: 3 
        }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Daftar Aset
          </Typography>
          
          <ReportGenerator categories={categories} />
        </Box>
        
        <AssetFilter onFilterChange={handleFilterChange} />
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : assets.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', my: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Tidak ada aset ditemukan
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Coba ubah filter atau cari dengan kata kunci lain
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {currentAssets.map((asset) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={asset._id}>
                  <AssetCard 
                    asset={asset} 
                    onDelete={handleDeleteClick}
                    onQrClick={handleQrClick}
                    isAdminMode={isAdminMode}
                  />
                </Grid>
              ))}
            </Grid>
            
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                  size={isMobile ? 'small' : 'medium'}
                />
              </Box>
            )}
          </>
        )}
      </Container>
      
      <Footer />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, assetId: null })}
      >
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus aset ini? Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, assetId: null })}>Batal</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* QR Code Dialog */}
      <QRCodeDisplay 
        assetId={qrDialog.assetId}
        assetName={qrDialog.assetName}
        open={qrDialog.open}
        onClose={() => setQrDialog({ open: false, assetId: null, assetName: '' })}
      />
    </Box>
  );
};

export default HomePage;