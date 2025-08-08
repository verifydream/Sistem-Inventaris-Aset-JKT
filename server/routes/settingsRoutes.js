const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Location = require('../models/Location');

// ===== CATEGORY ROUTES =====

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new category
router.post('/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Kategori dengan nama ini sudah ada' });
    }
    
    const newCategory = new Category({
      name,
      description
    });
    
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if category exists
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    
    // Check if new name already exists (if name is being changed)
    if (name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: 'Kategori dengan nama ini sudah ada' });
      }
    }
    
    category.name = name || category.name;
    category.description = description || category.description;
    category.updatedAt = Date.now();
    
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    
    await Category.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== LOCATION ROUTES =====

// Get all locations
router.get('/locations', async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new location
router.post('/locations', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if location already exists
    const existingLocation = await Location.findOne({ name });
    if (existingLocation) {
      return res.status(400).json({ message: 'Lokasi dengan nama ini sudah ada' });
    }
    
    const newLocation = new Location({
      name,
      description
    });
    
    const savedLocation = await newLocation.save();
    res.status(201).json(savedLocation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update location
router.put('/locations/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if location exists
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
    }
    
    // Check if new name already exists (if name is being changed)
    if (name !== location.name) {
      const existingLocation = await Location.findOne({ name });
      if (existingLocation) {
        return res.status(400).json({ message: 'Lokasi dengan nama ini sudah ada' });
      }
    }
    
    location.name = name || location.name;
    location.description = description || location.description;
    location.updatedAt = Date.now();
    
    const updatedLocation = await location.save();
    res.json(updatedLocation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete location
router.delete('/locations/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ message: 'Lokasi tidak ditemukan' });
    }
    
    await Location.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Lokasi berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;