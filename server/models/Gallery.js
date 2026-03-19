const mongoose = require('mongoose');

// Add eventId to your schema
const gallerySchema = new mongoose.Schema({
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // NEW FIELD
  title: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gallery', gallerySchema);