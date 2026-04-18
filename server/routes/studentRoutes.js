const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Club = require('../models/Club');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

// GET STUDENT DASHBOARD
router.get('/dashboard/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId)
      .populate('joinedClubs', 'name');

    const events = await Event.find({
      $or: [
        { participants: studentId },
        { pendingParticipants: studentId }
      ]
    })
    .populate('club', 'name')
    .sort({ createdAt: -1 });

    const registrations = events.map(event => ({
      _id: event._id,
      eventId: { title: event.title },
      clubId: { name: event.club?.name || "Club" },
      status: event.participants.some(
        id => id.toString() === studentId.toString()
      ) ? "approved" : "pending"
    }));

    const announcements = await Event.find({
      club: { $in: student.joinedClubs || [] }
    })
    .populate('club', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      joinedClubs: student.joinedClubs || [],
      registrations,
      announcements
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// JOIN CLUB - FIXED BAD REQUEST LOGIC
router.post('/join-club', async (req, res) => {
    try {
        const { userId, clubId } = req.body;

        // Log to see exactly what arrives at the server
        console.log("Join Request Data:", { userId, clubId });

        if (!userId || !clubId) {
            return res.status(400).json({ message: "Missing User ID or Club ID" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Logic Check: Use .toString() to compare MongoDB ObjectIds accurately
        const isAlreadyMember = user.joinedClubs.some(id => id.toString() === clubId);
        
        if (isAlreadyMember) {
            return res.status(400).json({ message: "You have already joined this club!" });
        }

        // Add to user's list
        user.joinedClubs.push(clubId);
        await user.save();

        // Increment club member count
        await Club.findByIdAndUpdate(clubId, { $inc: { members: 1 } });

        res.json({ 
            message: "Successfully joined the club!",
            joinedClubs: user.joinedClubs // Send updated list back to sync frontend
        });
    } catch (err) {
        console.error("Join Club Error:", err);
        res.status(500).json({ message: "Server error during join process" });
    }
});
router.put("/approve-registration", async (req, res) => {
  try {

    const { eventId, studentId } = req.body;

    const Event = require("../models/Event");

    await Event.updateOne(
      { _id: eventId, "participants._id": studentId },
      { $set: { "participants.$.approved": true } }
    );

    res.json({ message: "Student approved successfully" });

  } catch (err) {

    res.status(500).json({ message: "Approval failed" });

  }
});




module.exports = router;