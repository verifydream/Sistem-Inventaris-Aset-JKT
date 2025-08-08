import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Card,
  CardMedia,
  useMediaQuery,
  Tabs,
  Tab,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QRCodeDisplay from '../components/QRCodeDisplay';
import AssetHistory from '../components/AssetHistory';
import AISuggestions from '../components/AISuggestions';
import { useAdminMode } from '../context/AdminModeContext';
import axios from 'axios';

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAdminMode } = useAdminMode();
  
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrDialog, setQrDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [locations, setLocations] = useState([]);
  const [locationName, setLocationName] = useState('');
  
  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        setError('');
        
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/assets/${id}`);
        setAsset(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching asset:', error);
        setError('Gagal memuat data aset. Silakan coba lagi.');
        setLoading(false);
      }
    };
    
    fetchAsset();
  }, [id]);
  
  // Fetch locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/api/settings/locations`);
        setLocations(response.data || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };
    
    fetchLocations();
  }, []);
  
  // Set location name when asset and locations are loaded
  useEffect(() => {
    if (asset && asset.location) {
      // Handle location which might be an object or string ID
      if (typeof asset.location === 'object' && asset.location !== null) {
        setLocationName(asset.location.name);
      } else if (locations.length > 0) {
        const location = locations.find(loc => loc._id === asset.location);
        if (location) {
          setLocationName(location.name);
        } else {
          setLocationName(asset.location); // Fallback to ID if location not found
        }
      }
    }
  }, [asset, locations]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? asset.images.length - 1 : prev - 1
    );
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === asset.images.length - 1 ? 0 : prev + 1
    );
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
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Container sx={{ mt: 4, mb: 4, flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Container>
        <Footer />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Container sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Kembali
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }
  
  if (!asset) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Container sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Aset tidak ditemukan.
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Kembali
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Kembali
          </Button>
          
          <Box>
            <IconButton 
              color="primary" 
              onClick={() => setQrDialog(true)}
              title="Lihat QR Code"
              sx={{ mr: 1 }}
            >
              <QrCodeIcon />
            </IconButton>
            
            {isAdminMode && (
              <IconButton 
                color="primary" 
                onClick={() => navigate(`/admin/asset/edit/${asset._id}`)}
                title="Edit Aset"
              >
                <EditIcon />
              </IconButton>
            )}
          </Box>
        </Box>
        
        <Grid container spacing={4}>
          {/* Left column - Asset details */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {asset.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip 
                  label={asset.condition} 
                  color={getConditionColor(asset.condition)} 
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Kategori: {asset.category}
                </Typography>
                {asset.location && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                    Lokasi: {locationName}
                  </Typography>
                )}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pemilik
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {asset.owner}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tanggal Perolehan
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(asset.acquisitionDate)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Deskripsi
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {asset.description || 'Tidak ada deskripsi'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Asset Images */}
            {asset.images && asset.images.length > 0 ? (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Gambar Aset
                </Typography>
                
                <Box sx={{ position: 'relative' }}>
                  <Card>
                    <CardMedia
                      component="img"
                      image={`${process.env.REACT_APP_API_URL}/${asset.images[currentImageIndex]}`}
                      alt={`${asset.name} - Gambar ${currentImageIndex + 1}`}
                      sx={{ 
                        height: { xs: 200, sm: 300, md: 400 },
                        objectFit: 'contain',
                        bgcolor: 'black'
                      }}
                    />
                  </Card>
                  
                  {asset.images.length > 1 && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      mt: 1
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        Gambar {currentImageIndex + 1} dari {asset.images.length}
                      </Typography>
                      
                      <Box>
                        <Button size="small" onClick={handlePrevImage}>
                          Sebelumnya
                        </Button>
                        <Button size="small" onClick={handleNextImage}>
                          Selanjutnya
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            ) : (
              <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Tidak ada gambar untuk aset ini
                </Typography>
              </Paper>
            )}
          </Grid>
          
          {/* Right column - History and AI Suggestions */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="Riwayat Aset" />
                <Tab label="Saran AI" />
              </Tabs>
              
              <Box sx={{ p: 3 }}>
                {activeTab === 0 ? (
                  <AssetHistory assetId={asset._id} />
                ) : (
                  <AISuggestions assetId={asset._id} />
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      <Footer />
      
      {/* QR Code Dialog */}
      <QRCodeDisplay 
        assetId={asset._id}
        assetName={asset.name}
        open={qrDialog}
        onClose={() => setQrDialog(false)}
      />
    </Box>
  );
};

export default AssetDetail;