const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String },
  location: { type: String, required: true },

  participationType: {
    type: String,
    enum: ["individual", "group"],
    default: "individual"
  },

  teamSize: { type: Number, default: 1 },

  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },

  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  extraParticipants: [
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    roll: String,
    department: String
  }
],

  groupRegistrations: [
    {
      leader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      members: [String]
    }
  ],

  capacity: { type: Number, default: 100 }

  

}, { timestamps: true });

  

module.exports = mongoose.model("Event", EventSchema);