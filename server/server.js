const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const adminRoutes = require("./routes/adminRoutes");


const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Connection Error:", err));

// Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/club', require('./routes/clubRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/api/admin', require('./routes/studentRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));