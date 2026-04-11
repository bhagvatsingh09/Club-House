const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // BASIC INFO
  name: { type: String, required: true, trim: true },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },

  password: { type: String, required: true, minlength: 8 },

  role: {
    type: String,
    enum: ['Student', 'Faculty', 'Admin'],
    default: 'Student'
  },

  // COMMON FIELDS
  phone: { type: String },
  bio: { type: String, default: "No Bio Added" },
  photo: { type: String },

  // STUDENT FIELDS
  studentId: {
    type: String,
    required: function () {
      return this.role === 'Student';
    }
  },

  department: {
    type: String,
    required: function () {
      return this.role === 'Student' || this.role === 'Faculty';
    }
  },

  year: {
    type: String,
    required: function () {
      return this.role === 'Student';
    }
  },

  // FACULTY FIELD
  designation: {
    type: String,
    required: function () {
      return this.role === 'Faculty';
    }
  },

  // CLUB RELATED
  joinedClubs: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Club' }
  ],

  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    default: null
  },

  clubRole: {
    type: String,
    enum: ['Member', 'Volunteer'],
    default: 'Member'
  },

  volunteerClub: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Club',
  default: null
},
club: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Club'
},

isVolunteer: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);