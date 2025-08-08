import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';

const ReportGenerator = ({ categories }) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState({
    condition: '',
    category: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleGeneratePDF = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query string
      const queryParams = new URLSearchParams();
      if (filters.condition) queryParams.append('condition', filters.condition);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      // Generate PDF
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/reports/pdf?${queryParams.toString()}`,
        { responseType: 'blob' }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get current date for filename
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
      
      link.setAttribute('download', `SIA-JKT-${formattedDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setLoading(false);
      if (isMobile) setExpanded(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Gagal menghasilkan laporan PDF. Silakan coba lagi.');
      setLoading(false);
    }
  };
  
  const handleGenerateExcel = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query string
      const queryParams = new URLSearchParams();
      if (filters.condition) queryParams.append('condition', filters.condition);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      // Generate Excel
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/reports/excel?${queryParams.toString()}`,
        { responseType: 'blob' }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get current date for filename
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
      
      link.setAttribute('download', `SIA-JKT-${formattedDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setLoading(false);
      if (isMobile) setExpanded(false);
    } catch (error) {
      console.error('Error generating Excel:', error);
      setError('Gagal menghasilkan laporan Excel. Silakan coba lagi.');
      setLoading(false);
    }
  };
  
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  
  const conditionOptions = [
    { value: 'baik', label: 'Baik' },
    { value: 'rusak ringan', label: 'Rusak Ringan' },
    { value: 'rusak berat', label: 'Rusak Berat' },
    { value: 'tidak terpakai lagi', label: 'Tidak Terpakai Lagi' },
  ];
  
  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<DescriptionIcon />}
        onClick={handleOpenDialog}
        sx={{ mb: isMobile ? 2 : 0 }}
      >
        Buat Laporan
      </Button>
      
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Buat Laporan Aset</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Pilih filter untuk laporan aset. Anda dapat mengunduh laporan dalam format PDF atau Excel.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  name="condition"
                  label="Kondisi"
                  variant="outlined"
                  value={filters.condition}
                  onChange={handleChange}
                >
                  <MenuItem value="">Semua Kondisi</MenuItem>
                  {conditionOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  name="category"
                  label="Kategori"
                  variant="outlined"
                  value={filters.category}
                  onChange={handleChange}
                >
                  <MenuItem value="">Semua Kategori</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="startDate"
                  label="Tanggal Mulai"
                  variant="outlined"
                  value={filters.startDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  name="endDate"
                  label="Tanggal Akhir"
                  variant="outlined"
                  value={filters.endDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Batal</Button>
          <Button
            onClick={handleGenerateExcel}
            color="primary"
            startIcon={loading ? <CircularProgress size={20} /> : <TableViewIcon />}
            disabled={loading}
          >
            Excel
          </Button>
          <Button
            onClick={handleGeneratePDF}
            color="primary"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}
            disabled={loading}
          >
            PDF
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReportGenerator;