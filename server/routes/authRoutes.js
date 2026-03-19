const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// --- REGISTER ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validation: Prevent Admin registration
    if (role.toLowerCase() === 'admin') {
      return res.status(403).json({ message: "Admin accounts must be created manually." });
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create User
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role.charAt(0).toUpperCase() + role.slice(1) // Capitalize
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find User
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // 3. Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'your_secret_key', 
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role, email: user.email, clubId: user.clubId }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;