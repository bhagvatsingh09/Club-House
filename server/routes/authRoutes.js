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

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2. Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. Generate JWT Token
    // We include the role in the payload so the frontend can read it
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Send response
    // The frontend logic you shared earlier expects 'token' and 'user'
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // This will be 'Admin', 'Faculty', or 'Student'
        clubId: user.clubId
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;