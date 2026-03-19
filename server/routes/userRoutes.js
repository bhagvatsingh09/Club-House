// routes/userRoutes.js
const router = require('express').Router();
const User = require('../models/User');

// GET: Fetch User Profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
});

// PUT: Update User Profile (Bio, Name, etc.)
router.put('/:userId/update', async (req, res) => {
  try {
    const { name, bio, branch } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { name, bio, branch } },
      { new: true }
    ).select('-password');

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;