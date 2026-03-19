const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: { type: String, required: true, minlength: 8 },
  roll: { type: String, unique: true, sparse: true }, // Added roll number
  role: { 
    type: String, 
    enum: ['Student', 'Faculty', 'Admin'], 
    default: 'Student' 
  },
  // For Students: Clubs they have joined
  joinedClubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }],
  // For Faculty: The specific club they manage
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', default: null },
  // Role within a specific club (e.g., Volunteer)
  clubRole: { type: String, enum: ['Member', 'Volunteer'], default: 'Member' },
  bio: { type: String, default: "No Bio Added" },
  branch: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);