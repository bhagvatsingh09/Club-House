const router = require('express').Router();
const Event = require('../models/Event');
const User = require('../models/User');

// Create new event
router.post('/create', async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) { res.status(500).json(err); }
});

// Get events for a specific club
router.get('/club/:clubId', async (req, res) => {
  try {
    const events = await Event.find({ club: req.params.clubId })
      .populate('volunteers', 'name email')
      .populate('participants', 'name email')
      .sort({ date: 1 });
    res.json(events);
  } catch (err) { res.status(500).json(err); }
});

// Assign Volunteer
router.put('/:eventId/assign-volunteer', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.eventId,
      { $addToSet: { volunteers: req.body.userId } },
      { new: true }
    ).populate('volunteers', 'name');
    res.json(event);
  } catch (err) { res.status(500).json(err); }
});

// 1. GET: Fetch all pending approvals for all events of a specific club
router.get('/club/:clubId/pending', async (req, res) => {
  try {
    // Find events for this club that actually have pending participants
    const events = await Event.find({ 
      club: req.params.clubId,
      pendingParticipants: { $exists: true, $not: { $size: 0 } }
    }).populate('pendingParticipants', 'name email roll');

    // Flatten the data for the frontend table
    let pendingList = [];
    events.forEach(event => {
      event.pendingParticipants.forEach(user => {
        pendingList.push({
          eventId: event._id,
          eventName: event.title,
          eventDate: event.date,
          user: user
        });
      });
    });

    res.json(pendingList);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pending approvals", error: err.message });
  }
});

// 2. PUT: Approve a student for an event
router.put('/:eventId/approve/:userId', async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    
    // Remove from pending, add to participants
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { 
        $pull: { pendingParticipants: userId },
        $addToSet: { participants: userId } 
      },
      { new: true }
    );
    
    res.json({ message: "Student approved successfully", event: updatedEvent });
  } catch (err) {
    res.status(500).json({ message: "Approval failed" });
  }
});

// 3. PUT: Reject a student for an event
router.put('/:eventId/reject/:userId', async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    
    // Just remove from pending
    await Event.findByIdAndUpdate(
      eventId,
      { $pull: { pendingParticipants: userId } },
      { new: true }
    );
    
    res.json({ message: "Student rejected" });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed" });
  }
});

router.get('/', async (req, res) => {
  try {
    const { clubId } = req.query; // Capture from ?clubId=...
    
    // We use the 'club' field because that is what your model uses
    const filter = clubId ? { club: clubId } : {}; 
    
    const events = await Event.find(filter)
      .populate('volunteers', 'name email')
      .populate('participants', 'name email')
      .sort({ date: 1 });
      
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Error fetching events", error: err.message });
  }
});

router.post('/:eventId/register', async (req, res) => {
  try {
    const { userId } = req.body;
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check if user is already in any list
    const isAlreadyRegistered = event.participants.includes(userId) || 
                                 event.pendingParticipants.includes(userId);

    if (isAlreadyRegistered) {
      return res.status(400).json({ message: "You have already requested to join this event." });
    }

    event.pendingParticipants.push(userId);
    await event.save();

    res.json({ message: "Registration request sent successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// Get all events a specific user is involved in (Registered or Pending)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const events = await Event.find({
      $or: [
        { participants: userId },
        { pendingParticipants: userId }
      ]
    })
    .populate('club', 'name') // Get the club name
    .sort({ date: 1 });

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Error fetching your events", error: err.message });
  }
});

// Cancel registration / Leave event
router.put('/:eventId/cancel/:userId', async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    
    await Event.findByIdAndUpdate(eventId, {
      $pull: { 
        participants: userId, 
        pendingParticipants: userId 
      }
    });
    
    res.json({ message: "Registration cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel registration" });
  }
});

module.exports = router;