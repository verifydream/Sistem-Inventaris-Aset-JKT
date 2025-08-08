import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { useAdminMode } from '../context/AdminModeContext';

const Header = () => {
  const { isAdminMode, enterAdminMode, exitAdminMode } = useAdminMode();
  const [openDialog, setOpenDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleAdminClick = () => {
    if (isAdminMode) {
      exitAdminMode();
      navigate('/');
    } else {
      setOpenDialog(true);
    }
  };

  const handlePasswordSubmit = () => {
    if (enterAdminMode(password)) {
      setOpenDialog(false);
      setPassword('');
      setError('');
      navigate('/admin');
    } else {
      setError('Password salah!');
    }
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerToggle}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          Sistem Inventaris Aset JKT
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem button component={RouterLink} to="/">
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Beranda" />
        </ListItem>
        {isAdminMode && (
          <ListItem button component={RouterLink} to="/admin">
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard Admin" />
          </ListItem>
        )}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleAdminClick}>
          <ListItemIcon>
            {isAdminMode ? <LogoutIcon /> : <DashboardIcon />}
          </ListItemIcon>
          <ListItemText primary={isAdminMode ? "Keluar dari Mode Admin" : "Mode Admin"} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <QrCodeIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                flexGrow: 1,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Sistem Inventaris Aset JKT
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {!isMobile && (
            <Box sx={{ display: 'flex' }}>
              <Button color="inherit" component={RouterLink} to="/">
                Beranda
              </Button>
              {isAdminMode && (
                <Button color="inherit" component={RouterLink} to="/admin">
                  Dashboard
                </Button>
              )}
              <Button 
                color="inherit" 
                onClick={handleAdminClick}
                sx={{
                  bgcolor: isAdminMode ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                  '&:hover': {
                    bgcolor: isAdminMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {isAdminMode ? "Keluar dari Mode Admin" : "Mode Admin"}
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawer}
      </Drawer>
      
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Masuk ke Mode Admin</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!error}
            helperText={error}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handlePasswordSubmit();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Batal</Button>
          <Button onClick={handlePasswordSubmit} variant="contained" color="primary">
            Masuk
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;