const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String }, // Added time field for UI consistency
  location: { type: String, required: true },
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  
  // Participant Logic
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  capacity: { type: Number, default: 100 },
  banner: { type: String }, 
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);