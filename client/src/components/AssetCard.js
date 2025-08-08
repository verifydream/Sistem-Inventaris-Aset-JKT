import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  CardActionArea,
  CardActions,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import QrCodeIcon from '@mui/icons-material/QrCode';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAdminMode } from '../context/AdminModeContext';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  paddingTop: '56.25%', // 16:9 aspect ratio
  position: 'relative',
}));

const ConditionChip = styled(Chip)(({ condition, theme }) => {
  let color = 'success';
  
  switch (condition) {
    case 'baik':
      color = 'success';
      break;
    case 'rusak ringan':
      color = 'warning';
      break;
    case 'rusak berat':
      color = 'error';
      break;
    case 'tidak terpakai lagi':
      color = 'default';
      break;
    default:
      color = 'primary';
  }
  
  return {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 1,
    color: condition === 'tidak terpakai lagi' ? theme.palette.text.secondary : theme.palette.common.white,
  };
});

const AssetCard = ({ asset, onDelete }) => {
  const { isAdminMode } = useAdminMode();
  const { _id, name, owner, category, condition, images, acquisitionDate } = asset;
  
  // Format date
  const formattedDate = new Date(acquisitionDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  // Default image if no images are available
  const imageUrl = images && images.length > 0 
    ? `${process.env.REACT_APP_API_URL}${images[0]}` 
    : '/placeholder-asset.jpg';
  
  return (
    <StyledCard>
      <CardActionArea component={RouterLink} to={`/asset/${_id}`}>
        <StyledCardMedia
          image={imageUrl}
          title={name}
        >
          <ConditionChip 
            label={condition} 
            condition={condition} 
            color={condition === 'baik' ? 'success' : condition === 'rusak ringan' ? 'warning' : condition === 'rusak berat' ? 'error' : 'default'}
            size="small"
          />
        </StyledCardMedia>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h2" noWrap>
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Pemilik: {owner}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Kategori: {category}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tanggal Perolehan: {formattedDate}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button 
          size="small" 
          color="primary" 
          startIcon={<InfoIcon />}
          component={RouterLink} 
          to={`/asset/${_id}`}
        >
          Detail
        </Button>
        
        {isAdminMode && (
          <>
            <Button 
              size="small" 
              color="primary" 
              startIcon={<EditIcon />}
              component={RouterLink} 
              to={`/admin/asset/edit/${_id}`}
            >
              Edit
            </Button>
            <Button 
              size="small" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={() => onDelete(_id)}
            >
              Hapus
            </Button>
          </>
        )}
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Button 
          size="small" 
          color="secondary" 
          startIcon={<QrCodeIcon />}
          component={RouterLink} 
          to={`/asset/${_id}`}
          state={{ showQR: true }}
        >
          QR
        </Button>
      </CardActions>
    </StyledCard>
  );
};

export default AssetCard;