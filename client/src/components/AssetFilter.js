import React, { useState, useEffect } from 'react';
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
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const AssetFilter = ({ onFilterChange, categories: propCategories, locations: propLocations }) => {
  const [expanded, setExpanded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    condition: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Use categories and locations from props if available, otherwise fetch them
  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
    } else {
      const fetchCategories = async () => {
        try {
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          const response = await axios.get(`${apiUrl}/api/assets/categories/list`);
          setCategories(response.data || []);
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      };
      fetchCategories();
    }
  }, [propCategories]);
  
  useEffect(() => {
    if (propLocations && propLocations.length > 0) {
      setLocations(propLocations);
    } else {
      const fetchLocations = async () => {
        try {
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          const response = await axios.get(`${apiUrl}/api/assets/locations/list`);
          setLocations(response.data || []);
        } catch (error) {
          console.error('Error fetching locations:', error);
        }
      };
      fetchLocations();
    }
  }, [propLocations]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
    if (isMobile) setExpanded(false);
  };
  
  const handleReset = () => {
    setFilters({
      search: '',
      condition: '',
      category: '',
      location: '',
      startDate: '',
      endDate: '',
    });
    onFilterChange({
      search: '',
      condition: '',
      category: '',
      location: '',
      startDate: '',
      endDate: '',
    });
  };
  
  const conditionOptions = [
    { value: 'baik', label: 'Baik' },
    { value: 'rusak ringan', label: 'Rusak Ringan' },
    { value: 'rusak berat', label: 'Rusak Berat' },
    { value: 'tidak terpakai lagi', label: 'Tidak Terpakai Lagi' },
  ];
  
  return (
    <Paper sx={{ mb: 3, overflow: 'hidden' }}>
      {isMobile ? (
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon sx={{ mr: 1 }} />
              <Typography>Filter Aset</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <FilterForm 
              filters={filters}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              handleReset={handleReset}
              conditionOptions={conditionOptions}
              categories={categories}
              locations={locations}
              isMobile={isMobile}
            />
          </AccordionDetails>
        </Accordion>
      ) : (
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1 }} />
            Filter Aset
          </Typography>
          <FilterForm 
            filters={filters}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleReset={handleReset}
            conditionOptions={conditionOptions}
            categories={categories}
            locations={locations}
            isMobile={isMobile}
          />
        </Box>
      )}
    </Paper>
  );
};

const FilterForm = ({ 
  filters, 
  handleChange, 
  handleSubmit, 
  handleReset, 
  conditionOptions, 
  categories,
  locations,
  isMobile 
}) => {
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            name="search"
            label="Cari Aset"
            variant="outlined"
            value={filters.search}
            onChange={handleChange}
            placeholder="Cari berdasarkan nama, pemilik, atau deskripsi"
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              endAdornment: filters.search ? (
                <IconButton
                  size="small"
                  onClick={() => handleChange({ target: { name: 'search', value: '' } })}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : null,
            }}
          />
        </Grid>
        
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
              <MenuItem key={category._id} value={category.name}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            name="location"
            label="Lokasi"
            variant="outlined"
            value={filters.location}
            onChange={handleChange}
          >
            <MenuItem value="">Semua Lokasi</MenuItem>
            {locations && locations.map((location) => (
              <MenuItem key={location._id} value={location._id}>
                {location.name}
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
        
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: isMobile ? 'space-between' : 'flex-end', gap: 2, mt: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleReset}
              startIcon={<ClearIcon />}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<FilterListIcon />}
            >
              Terapkan Filter
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AssetFilter;