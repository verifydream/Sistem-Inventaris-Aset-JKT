import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Collapse,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from 'axios';

const AISuggestions = ({ assetId }) => {
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(true);
  
  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}/api/ai/suggestions/${assetId}`);
      setSuggestions(response.data.suggestions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      setError('Gagal mendapatkan saran AI. Silakan coba lagi.');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (assetId) {
      fetchSuggestions();
    }
  }, [assetId]);
  
  const handleRefresh = () => {
    fetchSuggestions();
  };
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  
  // Format suggestions text with line breaks
  const formatSuggestions = (text) => {
    if (!text) return '';
    
    // Split by double newlines to get paragraphs
    const paragraphs = text.split(/\n\n+/);
    
    return paragraphs.map((paragraph, index) => {
      // Check if paragraph is a numbered list item
      if (/^\d+\.\s/.test(paragraph)) {
        // Split by newline to get list items
        const listItems = paragraph.split(/\n/);
        return (
          <Box key={index} sx={{ mb: 2 }}>
            {listItems.map((item, i) => (
              <Typography key={i} variant="body1" paragraph>
                {item}
              </Typography>
            ))}
          </Box>
        );
      }
      
      return (
        <Typography key={index} variant="body1" paragraph>
          {paragraph}
        </Typography>
      );
    });
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 2 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SmartToyIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6">Saran AI</Typography>
        </Box>
        <Button
          size="small"
          onClick={toggleExpanded}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        >
          {expanded ? 'Sembunyikan' : 'Tampilkan'}
        </Button>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Collapse in={expanded}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Coba Lagi
            </Button>
          </>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              {formatSuggestions(suggestions)}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
              >
                Perbarui Saran
              </Button>
            </Box>
          </>
        )}
      </Collapse>
    </Paper>
  );
};

export default AISuggestions;