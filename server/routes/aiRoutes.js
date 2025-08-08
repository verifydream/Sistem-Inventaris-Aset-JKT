const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Asset = require('../models/Asset');
const AssetHistory = require('../models/AssetHistory');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Get AI suggestions for an asset
router.get('/suggestions/:id', async (req, res) => {
  try {
    // Get asset details
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Get asset history
    const history = await AssetHistory.find({ assetId: asset._id }).sort({ changedAt: -1 });
    
    // Prepare prompt for Gemini
    let prompt = `Berikan saran dan rekomendasi untuk aset berikut:\n`;
    prompt += `Nama: ${asset.name}\n`;
    prompt += `Pemilik: ${asset.owner}\n`;
    prompt += `Kategori: ${asset.category}\n`;
    prompt += `Deskripsi: ${asset.description}\n`;
    prompt += `Tanggal Perolehan: ${new Date(asset.acquisitionDate).toLocaleDateString('id-ID')}\n`;
    prompt += `Kondisi Saat Ini: ${asset.condition}\n\n`;
    
    if (history.length > 0) {
      prompt += `Riwayat Kondisi:\n`;
      history.forEach((record, index) => {
        prompt += `${index + 1}. ${new Date(record.changedAt).toLocaleDateString('id-ID')}: Berubah dari ${record.previousCondition} menjadi ${record.newCondition}\n`;
      });
      prompt += `\n`;
    }
    
    prompt += `Berdasarkan informasi di atas, berikan saran untuk:\n`;
    prompt += `1. Pemeliharaan aset yang optimal\n`;
    prompt += `2. Tindakan yang sebaiknya dilakukan berdasarkan kondisi dan riwayat aset\n`;
    prompt += `3. Perkiraan sisa masa pakai dan rekomendasi penggantian jika diperlukan\n`;
    prompt += `4. Tips untuk meningkatkan efisiensi penggunaan aset\n`;
    
    // Generate response from Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ suggestions: text });
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    res.status(500).json({ 
      message: 'Error generating AI suggestions', 
      error: error.message 
    });
  }
});

module.exports = router;