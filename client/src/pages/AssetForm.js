import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
  Divider,
} from '@mui/material';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
// Mengubah impor locale untuk date-fns v4
import { id as idLocale } from 'date-fns/locale/id';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';

const AssetForm = () => {
  const { id, action } = useParams();
  const navigate = useNavigate();
  const isEditMode = action === 'edit';
  
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    category: '',
    location: '',
    description: '',
    acquisitionDate: null,
    condition: '',
  });
  
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [imagePreview, setImagePreview] = useState([]);
  
  // Fetch asset data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchAsset = async () => {
        try {
          setFetchingData(true);
          setError('');
          
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          const response = await axios.get(`${apiUrl}/api/assets/${id}`);
          const asset = response.data;
          
          // Handle location which might be an object or string ID
          const locationValue = asset.location ? 
            (typeof asset.location === 'object' ? asset.location._id : asset.location) : 
            '';
            
          setFormData({
            name: asset.name,
            owner: asset.owner,
            category: asset.category,
            location: locationValue,
            description: asset.description || '',
            acquisitionDate: new Date(asset.acquisitionDate),
            condition: asset.condition,
          });
          
          if (asset.images && asset.images.length > 0) {
            setExistingImages(asset.images);
          }
          
          setFetchingData(false);
        } catch (error) {
          console.error('Error fetching asset:', error);
          setError('Gagal memuat data aset. Silakan coba lagi.');
          setFetchingData(false);
        }
      };
      
      fetchAsset();
    }
  }, [isEditMode, id]);
  
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
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, acquisitionDate: date }));
    
    // Clear validation error when field is updated
    if (validationErrors.acquisitionDate) {
      setValidationErrors(prev => ({ ...prev, acquisitionDate: '' }));
    }
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size and type
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });
    
    if (validFiles.length !== files.length) {
      setError('Beberapa file tidak valid. Pastikan ukuran file tidak melebihi 5MB dan format file adalah JPG, JPEG, PNG, atau GIF.');
      return;
    }
    
    // Check if total images would exceed 3
    if (existingImages.length + images.length + validFiles.length > 3) {
      setError('Maksimal 3 gambar diperbolehkan.');
      return;
    }
    
    setImages(prev => [...prev, ...validFiles]);
    
    // Generate preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
    
    // Clear error if it was related to images
    if (error.includes('gambar')) {
      setError('');
    }
  };
  
  const handleRemoveImage = (index) => {
    // Remove from preview
    const newPreviews = [...imagePreview];
    URL.revokeObjectURL(newPreviews[index]); // Free memory
    newPreviews.splice(index, 1);
    setImagePreview(newPreviews);
    
    // Remove from images array
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const handleRemoveExistingImage = (imagePath) => {
    // Add to images to remove list
    setImagesToRemove(prev => [...prev, imagePath]);
    
    // Remove from existing images list
    setExistingImages(prev => prev.filter(path => path !== imagePath));
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Nama aset harus diisi';
    if (!formData.owner.trim()) errors.owner = 'Pemilik aset harus diisi';
    if (!formData.category.trim()) errors.category = 'Kategori aset harus diisi';
    if (!formData.acquisitionDate) errors.acquisitionDate = 'Tanggal perolehan harus diisi';
    if (!formData.condition) errors.condition = 'Kondisi aset harus diisi';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess(false);
      
      const formDataToSend = new FormData();
      
      // Append form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('owner', formData.owner);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('acquisitionDate', formData.acquisitionDate.toISOString());
      formDataToSend.append('condition', formData.condition);
      
      // Append images
      images.forEach(image => {
        formDataToSend.append('images', image);
      });
      
      // Append images to remove if in edit mode
      if (isEditMode && imagesToRemove.length > 0) {
        imagesToRemove.forEach(image => {
          formDataToSend.append('imagesToRemove', image);
        });
      }
      
      let response;
      
      if (isEditMode) {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        response = await axios.put(
          `${apiUrl}/api/assets/${id}`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        response = await axios.post(
          `${apiUrl}/api/assets`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }
      
      setSuccess(true);
      setLoading(false);
      
      // Navigate to asset detail page after a short delay
      setTimeout(() => {
        navigate(`/asset/${response.data._id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error saving asset:', error);
      setError('Gagal menyimpan data aset. Silakan coba lagi.');
      setLoading(false);
    }
  };
  
  if (fetchingData) {
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
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Kembali
          </Button>
        </Box>
        
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h5" component="h1" gutterBottom>
            {isEditMode ? 'Edit Aset' : 'Tambah Aset Baru'}
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Data aset berhasil {isEditMode ? 'diperbarui' : 'ditambahkan'}!
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nama Aset"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  disabled={loading}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pemilik Aset"
                  name="owner"
                  value={formData.owner}
                  onChange={handleInputChange}
                  error={!!validationErrors.owner}
                  helperText={validationErrors.owner}
                  disabled={loading}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!validationErrors.category} disabled={loading} required>
                  <InputLabel id="category-label">Kategori</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Kategori"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category.name}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.category && (
                    <FormHelperText>{validationErrors.category}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!validationErrors.location} disabled={loading}>
                  <InputLabel id="location-label">Lokasi</InputLabel>
                  <Select
                    labelId="location-label"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    label="Lokasi"
                  >
                    <MenuItem value="">Pilih Lokasi</MenuItem>
                    {locations.map((location) => (
                      <MenuItem key={location._id} value={location._id}>
                        {location.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {validationErrors.location && (
                    <FormHelperText>{validationErrors.location}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={idLocale}>
                  <DatePicker
                    label="Tanggal Perolehan"
                    value={formData.acquisitionDate}
                    onChange={handleDateChange}
                    disabled={loading}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!validationErrors.acquisitionDate,
                        helperText: validationErrors.acquisitionDate,
                        required: true
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth error={!!validationErrors.condition} disabled={loading} required>
                  <InputLabel id="condition-label">Kondisi</InputLabel>
                  <Select
                    labelId="condition-label"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    label="Kondisi"
                  >
                    <MenuItem value="baik">Baik</MenuItem>
                    <MenuItem value="rusak ringan">Rusak Ringan</MenuItem>
                    <MenuItem value="rusak berat">Rusak Berat</MenuItem>
                    <MenuItem value="tidak terpakai lagi">Tidak Terpakai Lagi</MenuItem>
                  </Select>
                  {validationErrors.condition && (
                    <FormHelperText>{validationErrors.condition}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Deskripsi"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Gambar Aset (Maksimal 3)
                </Typography>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Gambar Saat Ini:
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                      {existingImages.map((imagePath, index) => (
                        <Box
                          key={index}
                          sx={{
                            position: 'relative',
                            width: 150,
                            height: 150,
                            border: '1px solid #ddd',
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={`${process.env.REACT_APP_API_URL}/${imagePath}`}
                            alt={`Aset ${index + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            sx={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              bgcolor: 'rgba(255, 255, 255, 0.7)',
                              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                            }}
                            onClick={() => handleRemoveExistingImage(imagePath)}
                            disabled={loading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
                
                {/* New Images Preview */}
                {imagePreview.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Gambar Baru:
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                      {imagePreview.map((preview, index) => (
                        <Box
                          key={index}
                          sx={{
                            position: 'relative',
                            width: 150,
                            height: 150,
                            border: '1px solid #ddd',
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            sx={{
                              position: 'absolute',
                              top: 5,
                              right: 5,
                              bgcolor: 'rgba(255, 255, 255, 0.7)',
                              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                            }}
                            onClick={() => handleRemoveImage(index)}
                            disabled={loading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
                
                {/* Upload Button */}
                {existingImages.length + images.length < 3 && (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddPhotoAlternateIcon />}
                    disabled={loading}
                  >
                    Tambah Gambar
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/jpg"
                      hidden
                      onChange={handleImageChange}
                      multiple={existingImages.length + images.length < 2}
                    />
                  </Button>
                )}
                
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  Format yang didukung: JPG, JPEG, PNG, GIF. Ukuran maksimal: 5MB per file.
                </Typography>
              </Grid>
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                    sx={{ minWidth: 120 }}
                  >
                    {loading ? <CircularProgress size={24} /> : isEditMode ? 'Perbarui' : 'Simpan'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
      
      <Footer />
    </Box>
  );
};

export default AssetForm;