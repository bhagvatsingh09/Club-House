// routes/userRoutes.js
const mongoose = require("mongoose");
const router = require('express').Router();
const User = require('../models/User');
const Event = require('../models/Event');

// GET: Fetch User Profile
router.get("/club-volunteers/:clubId", async (req, res) => {
  try {
    const clubId = new mongoose.Types.ObjectId(req.params.clubId);

    const volunteers = await User.find({
      volunteerClub: clubId,
      clubRole: "Volunteer"
    }).select("name email volunteerRole clubRole assignedTask taskDeadline taskStatus");

    console.log("FOUND VOLUNTEERS:", volunteers);

    res.json(volunteers);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed" });
  }
});

// PUT: Update User Profile (Bio, Name, etc.)
router.put('/:userId/update', async (req, res) => {
  try {
    const { name, bio, department, studentId, year, phone, designation, photo } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          name,
          bio,
          department,
          studentId,
          year,
          phone,
          designation,
          photo
        }
      },
      { new: true }
    ).select('-password');

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});


router.get("/:userId/registrations", async (req, res) => {
  try {
    const { userId } = req.params;

    const events = await Event.find({
      $or: [
        { participants: userId },
        { pendingParticipants: userId }
      ]
    }).populate("club", "name");

    const formatted = events.map(event => ({
      _id: event._id,
      eventId: { title: event.title },
      clubId: { name: event.club?.name },
      status: event.participants.some(
        id => id.toString() === userId.toString()
      )
        ? "approved"
        : "pending"
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.get('/', async (req, res) => {
  try {
    const { role } = req.query;

    const filter = role ? { role } : {};

    const users = await User.find(filter).select('-password');

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
});






module.exports = router;