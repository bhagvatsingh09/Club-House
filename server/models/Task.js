const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  directive: { type: String, required: true },
  deadline: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue'], 
    default: 'Pending' 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);