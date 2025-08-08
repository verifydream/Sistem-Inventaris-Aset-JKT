const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const Asset = require('../models/Asset');
const AssetHistory = require('../models/AssetHistory');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Get all assets
router.get('/', async (req, res) => {
  try {
    const { condition, category, location, startDate, endDate, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (condition) filter.condition = condition;
    if (category) filter.category = category;
    if (location) filter.location = location;
    
    // Date range filter
    if (startDate || endDate) {
      filter.acquisitionDate = {};
      if (startDate) filter.acquisitionDate.$gte = new Date(startDate);
      if (endDate) filter.acquisitionDate.$lte = new Date(endDate);
    }
    
    // Search by name, owner, or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { owner: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const assets = await Asset.find(filter).populate('location').sort({ createdAt: -1 });
    
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get asset by ID
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('location');
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    const assetObj = asset.toObject();
    
    res.json(assetObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new asset
router.post('/', upload.array('images', 3), async (req, res) => {
  try {
    const { name, owner, description, acquisitionDate, condition, category, location } = req.body;
    
    // Get file paths from uploaded images
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    // Create new asset
    const newAsset = new Asset({
      name,
      owner,
      description,
      acquisitionDate,
      condition,
      category,
      location,
      images
    });
    
    // Save asset to get ID for QR code
    const savedAsset = await newAsset.save();
    
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(`${process.env.CLIENT_URL}/asset/${savedAsset._id}`);
    
    // Update asset with QR code
    savedAsset.qrCode = qrCodeDataUrl;
    await savedAsset.save();
    
    res.status(201).json(savedAsset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update asset
router.put('/:id', upload.array('newImages', 3), async (req, res) => {
  try {
    const { name, owner, description, acquisitionDate, condition, category, location, removedImages } = req.body;
    const asset = await Asset.findById(req.params.id);
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Check if condition has changed
    if (condition && condition !== asset.condition) {
      // Create history record
      const historyRecord = new AssetHistory({
        assetId: asset._id,
        previousCondition: asset.condition,
        newCondition: condition,
        notes: req.body.notes || `Kondisi berubah dari ${asset.condition} menjadi ${condition}`
      });
      
      await historyRecord.save();
    }
    
    // Handle removed images
    let currentImages = [...asset.images];
    if (removedImages) {
      const removedImagesArray = Array.isArray(removedImages) 
        ? removedImages 
        : [removedImages];
      
      // Remove from database
      currentImages = currentImages.filter(img => !removedImagesArray.includes(img));
      
      // Remove files from server
      removedImagesArray.forEach(imgPath => {
        const filePath = path.join(__dirname, '..', imgPath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      currentImages = [...currentImages, ...newImages];
    }
    
    // Ensure max 3 images
    if (currentImages.length > 3) {
      currentImages = currentImages.slice(0, 3);
    }
    
    // Update asset
    asset.name = name || asset.name;
    asset.owner = owner || asset.owner;
    asset.description = description || asset.description;
    asset.acquisitionDate = acquisitionDate || asset.acquisitionDate;
    asset.condition = condition || asset.condition;
    asset.category = category || asset.category;
    asset.location = location;
    asset.images = currentImages;
    asset.updatedAt = Date.now();
    
    const updatedAsset = await asset.save();
    res.json(updatedAsset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete asset
router.delete('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Delete associated images
    if (asset.images && asset.images.length > 0) {
      asset.images.forEach(imgPath => {
        const filePath = path.join(__dirname, '..', imgPath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    // Delete asset history
    await AssetHistory.deleteMany({ assetId: asset._id });
    
    // Delete asset
    await Asset.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get asset history
router.get('/:id/history', async (req, res) => {
  try {
    const history = await AssetHistory.find({ assetId: req.params.id })
      .sort({ changedAt: -1 });
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get asset categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Asset.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get asset locations
router.get('/locations/list', async (req, res) => {
  try {
    const locations = await Asset.distinct('location');
    // Filter out null or empty values
    const filteredLocations = locations.filter(location => location);
    res.json(filteredLocations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;