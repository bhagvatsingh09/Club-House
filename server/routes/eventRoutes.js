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
      .populate('volunteers.user', 'name email')
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
    // const isVolunteer = event.volunteers?.some(
    //   v => v.toString() === userId
    // );

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
    const { role, clubId } = req.body;

    if (!clubId) {
      return res.status(400).json({ message: "clubId is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { clubRole: role },
      { returnDocument: 'after' } // ✅ fix warning also
    );

    res.json({ message: "Role updated", user });

  } catch (err) {
    console.error(err);
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

// ============================
// UPDATE EVENT
// ============================
router.put('/:eventId', async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      req.body,
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(updatedEvent);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

// DELET EVENT
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
    const { userId, role, assignedTask } = req.body;

    // 🔴 CHECK ACTIVE EVENT FIRST
    const activeEvent = await Event.findOne({
      "volunteers.user": userId,
      date: { $gte: new Date() }
    });

    if (activeEvent) {
      return res.status(400).json({
        message: "Volunteer is already assigned to an active event"
      });
    }

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // normalize old data
    event.volunteers = (event.volunteers || []).map(v => {
      if (v.user) return v;

      return {
        user: v,
        role: "",
        task: "",
        deadline: null
      };
    });

    const existing = event.volunteers.find(
      v => v.user.toString() === userId
    );

    if (existing) {
      existing.role = role;
      existing.task = assignedTask;
    } else {
      event.volunteers.push({
        user: userId,
        role,
        task: assignedTask,
        deadline: null
      });
    }

    await event.save();

    const updated = await Event.findById(req.params.eventId)
      .populate("volunteers.user", "name email");

    res.json(updated);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Assign failed" });
  }
});

// ============================
// REMOVE VOLUNTEER FROM EVENT
// ============================
router.put('/:eventId/remove-volunteer', async (req, res) => {
  try {
    const { userId } = req.body;

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // ✅ Normalize structure
    event.volunteers = event.volunteers.map(v => {
      if (v.user) return v;
      return { user: v };
    });

    const exists = event.volunteers.some(
      v => v.user.toString() === userId
    );

    if (!exists) {
      return res.status(400).json({ message: "User is not a volunteer" });
    }

    event.volunteers = event.volunteers.filter(
      v => v.user.toString() !== userId
    );

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate("participants", "name email")
      .populate("volunteers.user", "name email");

    res.json(updatedEvent);

  } catch (err) {
    console.error("REMOVE ERROR:", err);
    res.status(500).json({ message: "Failed to remove volunteer" });
  }
});

router.get("/volunteer/:id", async (req, res) => {
  try {
    const events = await Event.find({
      "volunteers.user": req.params.id
    })
      .populate("club", "name")
      .sort({ date: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// Upadate Role=======//
router.put("/:eventId/update-volunteer", async (req, res) => {
  try {
    const { userId, role, task, deadline } = req.body;

    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const volunteer = event.volunteers.find(
      v => v.user.toString() === userId
    );

    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }

    volunteer.role = role;
    volunteer.task = task;
    volunteer.deadline = deadline;

    await event.save();

    const updatedEvent = await Event.findById(req.params.id)
      .populate("participants", "name email")
      .populate("pendingParticipants", "name email")
      .populate("volunteers.user", "name email");

    res.json(updatedEvent);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

router.delete("/:eventId/remove-volunteer/:userId", async (req, res) => {
    try {
      const { eventId, userId } = req.params;

      const event = await Event.findById(eventId);

      if (!event) {
        return res.status(404).json({
          message: "Event not found"
        });
      }

      event.volunteers = event.volunteers.filter(
        (v) => v.user.toString() !== userId
      );

      await event.save();

      res.json({
        message: "Volunteer removed successfully"
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Remove failed"
      });
    }
  }
);

router.put("/:eventId/assign-volunteer", async (req, res) => {
  try {
    const { userId, role, task } = req.body;

    // console.log("REQ BODY:", req.body); // 👈 DEBUG

    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // ✅ push correct structure
    event.volunteers.push({
      user: userId,
      role,
      task: assignedTask || ""   // ✅ IMPORTANT
    });

    await event.save();

    const updatedEvent = await Event.findById(req.params.eventId)
      .populate("volunteers.user", "name");

    res.json(updatedEvent);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Assignment failed" });
  }
});




module.exports = router;