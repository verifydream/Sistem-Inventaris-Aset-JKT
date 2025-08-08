const mongoose = require('mongoose');

const assetHistorySchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  previousCondition: {
    type: String,
    enum: ['baik', 'rusak ringan', 'rusak berat', 'tidak terpakai lagi'],
    required: true
  },
  newCondition: {
    type: String,
    enum: ['baik', 'rusak ringan', 'rusak berat', 'tidak terpakai lagi'],
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('AssetHistory', assetHistorySchema);