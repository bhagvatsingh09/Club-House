const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // Optional link to event
  title: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  url: { type: String, required: true },
  public_id: String, // Cloudinary/S3 ID
}, { timestamps: true });

module.exports = mongoose.model('Media', MediaSchema);