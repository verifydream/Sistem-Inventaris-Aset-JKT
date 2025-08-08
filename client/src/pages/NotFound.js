import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
} from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Container maxWidth="md" sx={{ mt: 8, mb: 8, flexGrow: 1 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: '4rem', md: '6rem' }, fontWeight: 'bold', color: 'primary.main' }}>
            404
          </Typography>
          
          <Typography variant="h4" component="h2" gutterBottom>
            Halaman Tidak Ditemukan
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
            Maaf, halaman yang Anda cari tidak dapat ditemukan. Halaman mungkin telah dipindahkan, dihapus, atau tidak pernah ada.
          </Typography>
          
          <Button 
            component={Link} 
            to="/" 
            variant="contained" 
            color="primary" 
            size="large"
          >
            Kembali ke Beranda
          </Button>
        </Paper>
      </Container>
      
      <Footer />
    </Box>
  );
};

export default NotFound;