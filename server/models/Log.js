// models/Log.js
const mongoose = require("mongoose");
const Log = require("../models/Log");
const LogSchema = new mongoose.Schema({
  user: String,
  role: String,
  action: String,
  severity: {
    type: String,
    enum: ["info", "warning", "danger"],
    default: "info"
  },
  ip: String
}, { timestamps: true });

module.exports = mongoose.model("Log", LogSchema);