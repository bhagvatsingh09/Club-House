// routes/userRoutes.js
const router = require('express').Router();
const User = require('../models/User');
const Event = require('../models/Event');
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
    const { name, bio, branch, rollNo, photo } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { name, bio, branch, rollNo, photo } },
      { new: true }
    ).select('-password');

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// router.get("/:id/registrations", async (req, res) => {
//   const data = await Registration.find({ userId: req.params.id })
//     .populate("eventId", "title")
//     .populate("clubId", "name");

//   res.json(data);
// });

router.get('/:userId/registrations', async (req, res) => {
  try {
    const { userId } = req.params;

    const events = await Event.find({
      $or: [
        { participants: userId },
        { pendingParticipants: userId }
      ]
    }).populate('club', 'name');

    const formatted = events.map(event => ({
      _id: event._id,
      eventId: {
        title: event.title
      },
      clubId: {
        name: event.club?.name
      },
      status: event.participants.some(
        id => id.toString() === userId.toString()
      )
        ? "approved"
        : "pending"
    }));

    res.json(formatted);

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;