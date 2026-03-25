const router = require('express').Router();
const Event = require('../models/Event');

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
      .populate('pendingParticipants', 'name email') // ✅ FIX
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
    console.log("REQ BODY:", req.body); // 🔥 DEBUG

    const { userId, groupMembers, extraDetails } = req.body;

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
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

      // 🔥 SAVE EXTRA DETAILS (SAFE)
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
    console.error("REGISTER ERROR:", err); // 🔥 VERY IMPORTANT
    res.status(500).json({ message: "Registration failed", error: err.message });
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
    const events = await Event.find({
      club: req.params.clubId,
      pendingParticipants: { $exists: true, $not: { $size: 0 } }
    })
      .populate('pendingParticipants', 'name email rollNo')
      .select('title date pendingParticipants');

    const formatted = [];

    events.forEach(event => {
      event.pendingParticipants.forEach(user => {
        formatted.push({
          eventId: event._id,
          eventName: event.title,
          eventDate: event.date,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            roll: user.rollNo
          }
        });
      });
    });

    res.json(formatted);

  } catch (err) {
    console.error("Pending fetch error:", err);
    res.status(500).json({ message: "Failed to fetch pending approvals" });
  }
});

// ============================
// GET APPROVED STUDENTS
// ============================
router.get('/club/:clubId/approved', async (req, res) => {
  try {
    const events = await Event.find({
      club: req.params.clubId,
      participants: { $exists: true, $not: { $size: 0 } }
    })
      .populate('participants', 'name email rollNo')
      .select('title date participants');

    const formatted = [];

    events.forEach(event => {
      event.participants.forEach(user => {
        formatted.push({
          eventId: event._id,
          eventName: event.title,
          eventDate: event.date,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            roll: user.rollNo
          }
        });
      });
    });

    res.json(formatted);

  } catch (err) {
    console.error("Approved fetch error:", err);
    res.status(500).json({ message: "Failed to fetch approved students" });
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

module.exports = router;