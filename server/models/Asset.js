const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  acquisitionDate: {
    type: Date,
    required: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['baik', 'rusak ringan', 'rusak berat', 'tidak terpakai lagi'],
    default: 'baik'
  },
  images: [
    {
      type: String,
      trim: true
    }
  ],
  qrCode: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Generate URL for QR code
assetSchema.virtual('qrCodeUrl').get(function() {
  return `${process.env.CLIENT_URL}/asset/${this._id}`;
});

// Set toJSON option to include virtuals
assetSchema.set('toJSON', { virtuals: true });
assetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Asset', assetSchema);