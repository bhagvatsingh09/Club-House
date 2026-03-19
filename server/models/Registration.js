const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', registrationSchema);