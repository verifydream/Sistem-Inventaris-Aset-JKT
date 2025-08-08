import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import QrCodeIcon from '@mui/icons-material/QrCode';
import SettingsIcon from '@mui/icons-material/Settings';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AssetFilter from '../components/AssetFilter';
import QRCodeDisplay from '../components/QRCodeDisplay';
import ReportGenerator from '../components/ReportGenerator';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, assetId: null });
  const [qrDialog, setQrDialog] = useState({ open: false, assetId: null, assetName: '' });
  const [stats, setStats] = useState({
    total: 0,
    baik: 0,
    rusakRingan: 0,
    rusakBerat: 0,
    tidakTerpakai: 0,
  });
  
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
        if (filters.location) queryParams.append('location', filters.location);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/assets?${queryParams.toString()}`);
        setAssets(response.data);
        
        // Calculate stats
        const total = response.data.length;
        const baik = response.data.filter(asset => asset.condition === 'baik').length;
        const rusakRingan = response.data.filter(asset => asset.condition === 'rusak ringan').length;
        const rusakBerat = response.data.filter(asset => asset.condition === 'rusak berat').length;
        const tidakTerpakai = response.data.filter(asset => asset.condition === 'tidak terpakai lagi').length;
        
        setStats({
          total,
          baik,
          rusakRingan,
          rusakBerat,
          tidakTerpakai,
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assets:', error);
        setError('Gagal memuat data aset. Silakan coba lagi.');
        setLoading(false);
      }
    };
    
    fetchAssets();
  }, [filters]);
  
  // Fetch categories and locations
  useEffect(() => {
    const fetchCategoriesAndLocations = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        // Fetch categories from settings API
        const categoriesResponse = await axios.get(`${apiUrl}/api/settings/categories`);
        setCategories(categoriesResponse.data || []);
        
        // Fetch locations from settings API
        const locationsResponse = await axios.get(`${apiUrl}/api/settings/locations`);
        setLocations(locationsResponse.data || []);
      } catch (error) {
        console.error('Error fetching categories and locations:', error);
      }
    };
    
    fetchCategoriesAndLocations();
  }, []);
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleDeleteClick = (assetId) => {
    setDeleteDialog({ open: true, assetId });
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/assets/${deleteDialog.assetId}`);
      
      // Update assets list
      setAssets(assets.filter(asset => asset._id !== deleteDialog.assetId));
      
      // Update stats
      const deletedAsset = assets.find(asset => asset._id === deleteDialog.assetId);
      if (deletedAsset) {
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          baik: deletedAsset.condition === 'baik' ? prev.baik - 1 : prev.baik,
          rusakRingan: deletedAsset.condition === 'rusak ringan' ? prev.rusakRingan - 1 : prev.rusakRingan,
          rusakBerat: deletedAsset.condition === 'rusak berat' ? prev.rusakBerat - 1 : prev.rusakBerat,
          tidakTerpakai: deletedAsset.condition === 'tidak terpakai lagi' ? prev.tidakTerpakai - 1 : prev.tidakTerpakai,
        }));
      }
      
      setDeleteDialog({ open: false, assetId: null });
    } catch (error) {
      console.error('Error deleting asset:', error);
      setError('Gagal menghapus aset. Silakan coba lagi.');
    }
  };
  
  const handleQrClick = (assetId, assetName) => {
    setQrDialog({ open: true, assetId, assetName });
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  // Get condition chip color
  const getConditionColor = (condition) => {
    switch (condition) {
      case 'baik':
        return 'success';
      case 'rusak ringan':
        return 'warning';
      case 'rusak berat':
        return 'error';
      case 'tidak terpakai lagi':
        return 'default';
      default:
        return 'primary';
    }
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard Admin
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Kelola inventaris aset perusahaan dengan mudah dan efisien.
          </Typography>
        </Box>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Typography variant="h3" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body1">Total Aset</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%', borderTop: `4px solid ${theme.palette.success.main}` }}>
              <Typography variant="h3" color="success.main">
                {stats.baik}
              </Typography>
              <Typography variant="body1">Kondisi Baik</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%', borderTop: `4px solid ${theme.palette.warning.main}` }}>
              <Typography variant="h3" color="warning.main">
                {stats.rusakRingan}
              </Typography>
              <Typography variant="body1">Rusak Ringan</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', height: '100%', borderTop: `4px solid ${theme.palette.error.main}` }}>
              <Typography variant="h3" color="error.main">
                {stats.rusakBerat + stats.tidakTerpakai}
              </Typography>
              <Typography variant="body1">Rusak Berat/Tidak Terpakai</Typography>
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          mb: 3 
        }}>
          <ReportGenerator categories={categories} />
          
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<SettingsIcon />}
              onClick={() => navigate('/admin/settings')}
            >
              Pengaturan
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/asset/new')}
            >
              Tambah Aset Baru
            </Button>
          </Box>
        </Box>
        
        <AssetFilter 
          onFilterChange={handleFilterChange} 
          categories={categories} 
          locations={locations} 
        />
        
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
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Tidak ada aset ditemukan
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Coba ubah filter atau tambahkan aset baru
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/asset/new')}
              sx={{ mt: 2 }}
            >
              Tambah Aset Baru
            </Button>
          </Box>
        ) : (
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>Nama Aset</TableCell>
                    {!isMobile && <TableCell>Pemilik</TableCell>}
                    {!isMobile && <TableCell>Kategori</TableCell>}
                    {!isMobile && <TableCell>Lokasi</TableCell>}
                    <TableCell>Tanggal Perolehan</TableCell>
                    <TableCell>Kondisi</TableCell>
                    <TableCell align="center">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assets
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((asset) => (
                      <TableRow hover key={asset._id}>
                        <TableCell>{asset.name}</TableCell>
                        {!isMobile && <TableCell>{asset.owner}</TableCell>}
                        {!isMobile && <TableCell>{asset.category}</TableCell>}
                        {!isMobile && <TableCell>{typeof asset.location === 'object' && asset.location ? asset.location.name : (typeof asset.location === 'string' && asset.location ? asset.location : '-')}</TableCell>}
                        <TableCell>{formatDate(asset.acquisitionDate)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={asset.condition} 
                            color={getConditionColor(asset.condition)} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => navigate(`/asset/${asset._id}`)}
                              title="Lihat Detail"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={() => handleQrClick(asset._id, asset.name)}
                              title="Lihat QR Code"
                            >
                              <QrCodeIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => navigate(`/admin/asset/edit/${asset._id}`)}
                              title="Edit Aset"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteClick(asset._id)}
                              title="Hapus Aset"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={assets.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Baris per halaman:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
            />
          </Paper>
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

export default AdminDashboard;