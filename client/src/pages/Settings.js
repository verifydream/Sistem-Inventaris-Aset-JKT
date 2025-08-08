import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';

// Components
import Header from '../components/Header';
import Footer from '../components/Footer';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'category' or 'location'
  const [dialogAction, setDialogAction] = useState(''); // 'add' or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Define fetch functions with useCallback to avoid dependency warnings
  const fetchCategories = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/settings/categories`);
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Gagal memuat data kategori');
      setLoading(false);
    }
  }, [apiUrl]);
  
  const fetchLocations = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/settings/locations`);
      setLocations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Gagal memuat data lokasi');
      setLoading(false);
    }
  }, [apiUrl]);
  
  // Fetch categories and locations
  useEffect(() => {
    fetchCategories();
    fetchLocations();
  }, [fetchCategories, fetchLocations]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleOpenDialog = (type, action, item = null) => {
    setDialogType(type);
    setDialogAction(action);
    setSelectedItem(item);
    
    if (action === 'edit' && item) {
      setFormData({
        name: item.name,
        description: item.description || ''
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
    
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setFormData({
      name: '',
      description: ''
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const endpoint = dialogType === 'category' ? 'categories' : 'locations';
      
      if (dialogAction === 'add') {
        await axios.post(`${apiUrl}/api/settings/${endpoint}`, formData);
        setSuccess(`${dialogType === 'category' ? 'Kategori' : 'Lokasi'} berhasil ditambahkan`);
      } else {
        await axios.put(`${apiUrl}/api/settings/${endpoint}/${selectedItem._id}`, formData);
        setSuccess(`${dialogType === 'category' ? 'Kategori' : 'Lokasi'} berhasil diperbarui`);
      }
      
      // Refresh data
      if (dialogType === 'category') {
        fetchCategories();
      } else {
        fetchLocations();
      }
      
      handleCloseDialog();
      setLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Error saving data:', error);
      setError(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
      setLoading(false);
    }
  };
  
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus ${type === 'category' ? 'kategori' : 'lokasi'} ini?`)) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const endpoint = type === 'category' ? 'categories' : 'locations';
      await axios.delete(`${apiUrl}/api/settings/${endpoint}/${id}`);
      
      setSuccess(`${type === 'category' ? 'Kategori' : 'Lokasi'} berhasil dihapus`);
      
      // Refresh data
      if (type === 'category') {
        fetchCategories();
      } else {
        fetchLocations();
      }
      
      setLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Error deleting data:', error);
      setError(error.response?.data?.message || 'Terjadi kesalahan saat menghapus data');
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin')}
          >
            Kembali ke Dashboard
          </Button>
        </Box>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Pengaturan
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Kategori" />
              <Tab label="Lokasi" />
            </Tabs>
          </Box>
          
          {/* Categories Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('category', 'add')}
                >
                  Tambah Kategori
                </Button>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : categories.length === 0 ? (
                <Typography variant="body1" sx={{ py: 4, textAlign: 'center' }}>
                  Belum ada kategori. Silakan tambahkan kategori baru.
                </Typography>
              ) : (
                <List>
                  {categories.map((category) => (
                    <React.Fragment key={category._id}>
                      <ListItem>
                        <ListItemText
                          primary={category.name}
                          secondary={category.description || 'Tidak ada deskripsi'}
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => handleOpenDialog('category', 'edit', category)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" onClick={() => handleDelete('category', category._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}
          
          {/* Locations Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('location', 'add')}
                >
                  Tambah Lokasi
                </Button>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : locations.length === 0 ? (
                <Typography variant="body1" sx={{ py: 4, textAlign: 'center' }}>
                  Belum ada lokasi. Silakan tambahkan lokasi baru.
                </Typography>
              ) : (
                <List>
                  {locations.map((location) => (
                    <React.Fragment key={location._id}>
                      <ListItem>
                        <ListItemText
                          primary={location.name}
                          secondary={location.description || 'Tidak ada deskripsi'}
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => handleOpenDialog('location', 'edit', location)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton edge="end" onClick={() => handleDelete('location', location._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}
        </Paper>
      </Container>
      
      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogAction === 'add' ? 'Tambah' : 'Edit'} {dialogType === 'category' ? 'Kategori' : 'Lokasi'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nama"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Deskripsi (opsional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Batal</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!formData.name.trim()}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
      
      <Footer />
    </Box>
  );
};

export default Settings;