const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }],

  directive: { type: String, required: true },
  deadline: { type: Date, required: true },

  responses: [
    {
      club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' }, // ✅ FIXED
      status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
      },
      reason: String
    }
  ],

  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  }

}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);