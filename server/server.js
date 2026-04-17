const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const volunteerRoutes = require("./routes/volunteerRoutes");
const app = express();
const attendanceRoutes = require("./routes/attendance");

// ✅ FIXED Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Error:", err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/club', require('./routes/clubRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use("/api/volunteer", require("./routes/volunteerRoutes"));
app.use("/api/attendance", attendanceRoutes);

// Static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));