const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["Present"], default: "Present" },
  markedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Attendance", attendanceSchema);