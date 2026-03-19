const router = require("express").Router();

const User = require("../models/User");
const Event = require("../models/Event");
const Gallery = require("../models/Gallery");
const Club = require("../models/Club");


// ============================
// GET ALL CLUBS
// ============================
router.get("/", async (req, res) => {
  try {

    const clubs = await Club.find({ status: "Active" });

    res.json(clubs);

  } catch (err) {

    console.log(err);

    res.status(500).json({ message: "Error fetching clubs" });

  }
});


// ============================
// GET CLUB DASHBOARD STATS
// ============================
router.get("/:clubId/stats", async (req, res) => {
  try {

    const clubId = req.params.clubId;

    const members = await User.countDocuments({ clubId: clubId });

    const events = await Event.countDocuments({ club: clubId });

    const gallery = await Gallery.countDocuments({ club: clubId });

    const pendingEvents = await Event.find({
      club: clubId,
      pendingParticipants: { $exists: true, $not: { $size: 0 } }
    });

    let pendingApprovals = 0;

    pendingEvents.forEach(event => {
      pendingApprovals += event.pendingParticipants.length;
    });

    const club = await Club.findById(clubId);

    res.json({
      clubName: club?.name || "Club",
      members,
      events,
      gallery,
      pendingApprovals
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Failed to load dashboard stats"
    });

  }
});


// ============================
// JOIN CLUB
// ============================
router.post("/students/join-club", async (req, res) => {

  try {

    const { userId, clubId } = req.body;

    const user = await User.findById(userId);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.joinedClubs.includes(clubId))
      return res.status(400).json({ message: "Already joined" });

    user.joinedClubs.push(clubId);
    user.clubId = clubId;

    await user.save();

    await Club.findByIdAndUpdate(
      clubId,
      { $inc: { membersCount: 1 } }
    );

    res.json({ message: "Joined successfully" });

  } catch (err) {

    res.status(500).json({ message: "Server error" });

  }

});


// ============================
// GET MEMBERS
// ============================
router.get("/:clubId/members", async (req, res) => {

  try {

    const members = await User.find({
      clubId: req.params.clubId,
      role: "Student"
    }).select("name email roll clubRole");

    res.json(members);

  } catch (err) {

    res.status(500).json({ message: "Error fetching members" });

  }

});


// ============================
// UPDATE ROLE
// ============================
router.put("/update-role/:userId", async (req, res) => {

  try {

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { clubRole: req.body.role },
      { new: true }
    );

    res.json(updatedUser);

  } catch (err) {

    res.status(500).json({ message: "Update failed" });

  }

});


// ============================
// REMOVE MEMBER
// ============================
router.put("/remove-member/:userId", async (req, res) => {

  try {

    const user = await User.findById(req.params.userId);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const clubId = user.clubId;

    user.clubId = null;
    user.clubRole = "Member";

    user.joinedClubs = user.joinedClubs.filter(
      c => c.toString() !== clubId.toString()
    );

    await user.save();

    await Club.findByIdAndUpdate(
      clubId,
      { $inc: { membersCount: -1 } }
    );

    res.json({ message: "Member removed" });

  } catch (err) {

    res.status(500).json({ message: "Removal failed" });

  }

});
router.get("/:clubId/registrations", async (req, res) => {

  try {

    const clubId = req.params.clubId;

    const events = await Event.find({ club: clubId })
      .populate("pendingParticipants", "name email");

    let registrations = [];

    events.forEach(event => {

      if (!event.pendingParticipants) return;

      event.pendingParticipants.forEach(student => {

        registrations.push({
          studentId: student._id,
          name: student.name,
          email: student.email,
          clubName: event.clubName || "Club",
          eventName: event.title,
          eventId: event._id
        });

      });

    });

    res.json(registrations);

  } catch (err) {

    console.log("Registration fetch error:", err);

    res.status(500).json({ message: "Server Error" });

  }

});

// ============================
// GET APPROVED STUDENTS (CLUB)
// ============================
router.get("/:clubId/approved-students", async (req, res) => {

  try {

    const clubId = req.params.clubId;

    const events = await Event.find({ club: clubId })
      .populate("participants", "name email");

    let approvedStudents = [];

    events.forEach(event => {

      if (!event.participants) return;

      event.participants.forEach(student => {

        approvedStudents.push({
          studentId: student._id,
          name: student.name,
          email: student.email,
          clubName: event.clubName,
          eventName: event.title
        });

      });

    });

    res.json(approvedStudents);

  } catch (err) {

    console.log(err);
    res.status(500).json({ message: "Error fetching approved students" });

  }

});
// ============================
// CLUB - GET APPROVED STUDENTS
// ============================
router.get("/club/:clubId/approved-students", async (req, res) => {

  const events = await Event.find({
    club: req.params.clubId
  })
  .populate("participants", "name email");

  let students = [];

  events.forEach(event => {

    event.participants.forEach(student => {

      students.push({
        studentId: student._id,
        name: student.name,
        email: student.email,
        eventName: event.title,
        eventId: event._id
      });

    });

  });

  res.json(students);

});

router.get("/club/:clubId/stats", async (req, res) => {

  try {

    const clubId = req.params.clubId;

    const club = await Club.findById(clubId);

    // active members of this club
    const members = await User.countDocuments({
      club: clubId
    });

    // events of this club
    const events = await Event.countDocuments({
      club: clubId
    });

    // gallery items of this club
    const gallery = await Gallery.countDocuments({
      club: clubId
    });

    // pending event approvals
    const pendingApprovals = await Event.countDocuments({
      club: clubId,
      status: "pending"
    });

    res.json({
      clubName: club.name,
      members,
      events,
      gallery,
      pendingApprovals
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Server Error"
    });

  }

});

router.get("/:clubId/stats", async (req, res) => {
  try {
    const clubId = req.params.clubId;

    // Only student members
    const members = await User.countDocuments({ clubId: clubId, role: "Student" });

    const events = await Event.countDocuments({ club: clubId });
    const gallery = await Gallery.countDocuments({ club: clubId });

    const pendingEvents = await Event.find({
      club: clubId,
      pendingParticipants: { $exists: true, $not: { $size: 0 } }
    });

    let pendingApprovals = 0;
    pendingEvents.forEach(event => {
      pendingApprovals += event.pendingParticipants.length;
    });

    const club = await Club.findById(clubId);

    res.json({
      clubName: club?.name || "Club",
      members,
      events,
      gallery,
      pendingApprovals
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
});

// ============================
// GET CLUB NOTIFICATIONS
// ============================
router.get('/notifications/:clubId', async (req, res) => {

  try {

    const notifications = await Notification.find({
      club: req.params.clubId
    })
    .sort({ createdAt: -1 });

    res.json(notifications);

  } catch (err) {

    res.status(500).json({
      message: "Failed to load notifications"
    });

  }

});

module.exports = router;