const mongoose = require("mongoose");

const ClubSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    unique: true
  },

  description: {
    type: String,
    required: true
  },

  category: {
    type: String,
    enum: ["Technical", "Cultural", "Sports", "Other"],
    required: true
  },

  headCoordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  banner: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },

  membersCount: {
    type: Number,
    default: 0
  },
image: {
  type: String,
  default: "https://via.placeholder.com/300x200"
}
  

  

}, { timestamps: true });


module.exports = mongoose.model("Club", ClubSchema);