import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { useReactToPrint } from 'react-to-print';

const QRCodeDisplay = ({ assetId, assetName, open, onClose }) => {
  const qrCodeRef = useRef();
  const printRef = useRef();
  
  // URL for QR code
  const qrCodeUrl = `${window.location.origin}/asset/${assetId}`;
  
  // Handle print
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });
  
  // Handle download
  const handleDownload = () => {
    const svg = qrCodeRef.current;
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      // Download PNG
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-${assetName.replace(/\s+/g, '-')}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>QR Code Aset</DialogTitle>
      <DialogContent>
        <Box ref={printRef} sx={{ p: 2 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              border: '1px dashed #ccc'
            }}
          >
            <Typography variant="h6" gutterBottom>
              {assetName}
            </Typography>
            
            <Box sx={{ my: 2 }}>
              <QRCodeSVG 
                value={qrCodeUrl} 
                size={200} 
                level="H"
                includeMargin={true}
                ref={qrCodeRef}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" align="center">
              Scan QR code untuk melihat detail aset
            </Typography>
            
            <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 1 }}>
              {qrCodeUrl}
            </Typography>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Tutup</Button>
        <Button startIcon={<PrintIcon />} onClick={handlePrint}>Cetak</Button>
        <Button startIcon={<DownloadIcon />} onClick={handleDownload}>Unduh</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeDisplay;