import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  useTheme,
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

const AssetHistory = ({ history }) => {
  const theme = useTheme();
  
  if (!history || history.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HistoryIcon sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6">Riwayat Kondisi Aset</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Belum ada riwayat perubahan kondisi untuk aset ini
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  // Function to get chip color based on condition
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
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <HistoryIcon sx={{ mr: 1 }} color="primary" />
        <Typography variant="h6">Riwayat Kondisi Aset</Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      <List sx={{ width: '100%' }}>
        {history.map((record, index) => (
          <ListItem 
            key={record._id} 
            alignItems="flex-start"
            sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              py: 2,
              borderBottom: index < history.length - 1 ? `1px dashed ${theme.palette.divider}` : 'none'
            }}
          >
            <ListItemIcon sx={{ minWidth: { xs: 0, sm: 40 }, mb: { xs: 1, sm: 0 } }}>
              <TimelineIcon color="action" />
            </ListItemIcon>
            
            <ListItemText
              primary={
                <Typography variant="body1" component="span">
                  {formatDate(record.changedAt)}
                </Typography>
              }
              sx={{ mr: 2 }}
            />
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flexWrap: 'wrap',
              mt: { xs: 1, sm: 0 },
              gap: 1
            }}>
              <Chip 
                label={record.previousCondition} 
                color={getConditionColor(record.previousCondition)} 
                size="small" 
                variant="outlined"
              />
              
              <ArrowRightAltIcon sx={{ mx: 1 }} />
              
              <Chip 
                label={record.newCondition} 
                color={getConditionColor(record.newCondition)} 
                size="small"
              />
            </Box>
            
            {record.notes && (
              <ListItemText
                secondary={record.notes}
                sx={{ 
                  mt: { xs: 1, sm: 0 },
                  ml: { xs: 0, sm: 2 }
                }}
              />
            )}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default AssetHistory;