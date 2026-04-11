const router = require('express').Router();
const Event = require('../models/Event');
const User = require("../models/User");

// ============================
// CREATE EVENT
// ============================
router.post('/create', async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ============================
// GET EVENTS BY CLUB (FIXED)
// ============================
router.get('/club/:clubId', async (req, res) => {
  try {
    const events = await Event.find({ club: req.params.clubId })
      .populate('participants', 'name email')
      .populate('pendingParticipants', 'name email')
      .populate('volunteers', 'name email')
      .populate('club', 'name')
      .sort({ date: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ============================
// GET ALL EVENTS (FIXED)
// ============================
router.get('/', async (req, res) => {
  try {
    const { clubId } = req.query;
    const filter = clubId ? { club: clubId } : {};

    const events = await Event.find(filter)
      .populate('participants', 'name email')
      .populate('pendingParticipants', 'name email') // ✅ FIX
      .sort({ date: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Error fetching events" });
  }
});

// ============================
// REGISTER EVENT (FINAL FIX)
// ============================
router.post('/:eventId/register', async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const { userId, groupMembers, extraDetails } = req.body;

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // 🔥 PREVENT VOLUNTEER REGISTRATION
    const isVolunteer = event.volunteers?.some(
      v => v.toString() === userId
    );

    if (isVolunteer) {
      return res.status(400).json({
        message: "You are a volunteer for this event and cannot register"
      });
    }

    // 🚨 Capacity check
    if (event.participants.length >= event.capacity) {
      return res.status(400).json({ message: "Event is full" });
    }

    // ✅ GROUP REGISTRATION
    if (event.participationType === "group") {

      if (!groupMembers || groupMembers.length === 0) {
        return res.status(400).json({ message: "Add group member emails" });
      }

      if (groupMembers.length + 1 > event.teamSize) {
        return res.status(400).json({
          message: `Max ${event.teamSize} members allowed`
        });
      }

      const alreadyRegistered = event.groupRegistrations.some(
        g => g.leader.toString() === userId
      );

      if (alreadyRegistered) {
        return res.status(400).json({ message: "Already registered" });
      }

      event.groupRegistrations.push({
        leader: userId,
        members: groupMembers
      });

    } else {

      // ✅ INDIVIDUAL
      const already =
        event.participants.some(id => id.toString() === userId) ||
        event.pendingParticipants.some(id => id.toString() === userId);

      if (already) {
        return res.status(400).json({ message: "Already registered" });
      }

      // 🔥 ENSURE ARRAY EXISTS
      if (!event.extraParticipants) {
        event.extraParticipants = [];
      }

      // 🔥 SAVE EXTRA DETAILS
      if (extraDetails) {
        event.extraParticipants.push({
          user: userId,
          name: extraDetails.name || "",
          roll: extraDetails.roll || "",
          department: extraDetails.department || ""
        });
      }

      // 🔥 ADD TO PENDING
      event.pendingParticipants.push(userId);
    }

    await event.save();

    res.json({ message: "Registration successful!" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      message: "Registration failed",
      error: err.message
    });
  }
});
// ============================
// APPROVE STUDENT
// ============================
router.put('/:eventId/approve/:userId', async (req, res) => {
  try {
    const { eventId, userId } = req.params;

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        $pull: { pendingParticipants: userId },
        $addToSet: { participants: userId }
      },
      { new: true }
    );

    res.json({ message: "Approved", event: updatedEvent });
  } catch {
    res.status(500).json({ message: "Approval failed" });
  }
});

// ============================
// REJECT STUDENT
// ============================
router.put('/:eventId/reject/:userId', async (req, res) => {
  try {
    await Event.findByIdAndUpdate(
      req.params.eventId,
      { $pull: { pendingParticipants: req.params.userId } }
    );

    res.json({ message: "Rejected" });
  } catch {
    res.status(500).json({ message: "Rejection failed" });
  }
});

// ============================
// USER EVENTS
// ============================
router.get('/user/:userId', async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { participants: req.params.userId },
        { pendingParticipants: req.params.userId }
      ]
    }).populate('club', 'name');

    res.json(events);
  } catch {
    res.status(500).json({ message: "Error fetching events" });
  }
});

// ============================
// CANCEL REGISTRATION
// ============================
router.put('/:eventId/cancel/:userId', async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.eventId, {
      $pull: {
        participants: req.params.userId,
        pendingParticipants: req.params.userId
      }
    });

    res.json({ message: "Cancelled successfully" });
  } catch {
    res.status(500).json({ message: "Cancel failed" });
  }
});

// ============================
// GET PENDING APPROVALS (FOR FACULTY)
// ============================
router.get('/club/:clubId/pending', async (req, res) => {
  try {
    const events = await Event.find({ club: req.params.clubId })
      .populate("pendingParticipants", "name studentId department year email")
      .select("title date pendingParticipants");

    const formatted = [];

    events.forEach(event => {
      event.pendingParticipants.forEach(user => {
        formatted.push({
          eventId: event._id,
          eventName: event.title,
          eventDate: event.date,
          user: user
        });
      });
    });

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching pending approvals" });
  }
});
// ============================
// GET APPROVED STUDENTS
// ============================
router.get('/club/:clubId/approved', async (req, res) => {
  try {
    const events = await Event.find({ club: req.params.clubId })
      .populate("participants", "name studentId department year email")
      .select("title date participants");

    const formatted = [];

    events.forEach(event => {
      event.participants.forEach(user => {
        formatted.push({
          eventId: event._id,
          eventName: event.title,
          eventDate: event.date,
          user: user
        });
      });
    });

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching approved students" });
  }
});

// ============================
// UPDATE MEMBER ROLE
// ============================
router.put('/update-role/:userId', async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { clubRole: role },
      { new: true }
    );

    res.json({ message: "Role updated", user });

  } catch (err) {
    res.status(500).json({ message: "Failed to update role" });
  }
});

// ============================
// REMOVE MEMBER
// ============================
router.put('/remove-member/:userId', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, {
      $set: { clubId: null, clubRole: "Member" }
    });

    res.json({ message: "Member removed" });

  } catch {
    res.status(500).json({ message: "Remove failed" });
  }
});

router.delete('/:eventId', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.eventId);
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// routes/events.js

// ASSIGN VOLUNTEER
// Assign a volunteer to an event
router.put("/:eventId/assign-volunteer", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ message: "User ID required" });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Use the event's club as reference
    const clubId = event.club?.toString(); // Assuming event.club stores the club ID
    if (!clubId) return res.status(400).json({ message: "Event has no club assigned" });

    // Prevent assigning a member who is already a volunteer in another club
    if (user.volunteerClub && user.volunteerClub.toString() !== clubId) {
      return res.status(400).json({ message: "User is a volunteer in another club" });
    }

    // Assign volunteer to event
    if (!event.volunteers.includes(user._id)) {
      event.volunteers.push(user._id);
    }
    await event.save();

    // Update user
    user.clubRole = "Volunteer";
    user.volunteerClub = clubId;
    await user.save();

    // Return event with populated volunteers
    const populatedEvent = await Event.findById(eventId).populate("volunteers", "name email");
    return res.json(populatedEvent);

  } catch (err) {
    console.error("Assign volunteer error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================
// REMOVE VOLUNTEER FROM EVENT
// ============================
router.put('/:eventId/remove-volunteer', async (req, res) => {
  try {
    const { userId } = req.body;

    const event = await Event.findById(req.params.eventId)
      .populate('participants', 'name email')
      .populate('volunteers', 'name email');

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // ❌ Check if user is actually a volunteer in this event
    const isVolunteer = event.volunteers.some(
      v => v._id.toString() === userId
    );

    if (!isVolunteer) {
      return res.status(400).json({ message: "User is not a volunteer in this event" });
    }

    // ✅ Remove from volunteers array ONLY (not from club)
    event.volunteers = event.volunteers.filter(
      v => v._id.toString() !== userId
    );

    await event.save();

    // 🔁 Return updated event with populated data
    const updatedEvent = await Event.findById(event._id)
      .populate('participants', 'name email')
      .populate('volunteers', 'name email');

    res.json(updatedEvent);

  } catch (err) {
    console.error("Remove volunteer error:", err);
    res.status(500).json({ message: "Failed to remove volunteer" });
  }
});


module.exports = router;

module.exports = router;