const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      studentId,
      department,
      year,
      phone,
      designation,
      bio
    } = req.body;

    // 1. Prevent Admin registration
    if (role.toLowerCase() === 'admin') {
      return res.status(403).json({
        message: "Admin accounts must be created manually."
      });
    }

    // 2. Email already exists
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    // 3. Phone already exists
    if (phone) {
      const existingPhone = await User.findOne({ phone });

      if (existingPhone) {
        return res.status(400).json({
          message: "Phone already exists"
        });
      }
    }

    // 4. Student ID already exists
    if (role === 'student' && studentId) {
      const existingStudentId = await User.findOne({ studentId });

      if (existingStudentId) {
        return res.status(400).json({
          message: "Student ID already exists"
        });
      }
    }

    // 5. Basic validation
    if (!name || !email || !password || !department) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    // 6. Role based validation
    if (role === 'student') {
      if (!studentId || !year) {
        return res.status(400).json({
          message: "Student ID and Year are required"
        });
      }
    }

    if (role === 'faculty') {
      if (!designation) {
        return res.status(400).json({
          message: "Designation is required"
        });
      }
    }

    // 7. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 8. Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role.charAt(0).toUpperCase() + role.slice(1),

      studentId,
      department,
      year,
      phone,
      designation,
      bio
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message
    });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Send response
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        year: user.year,
        designation: user.designation,
        phone: user.phone,
        bio: user.bio,
        clubId: user.clubId,
        clubRole: user.clubRole
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;