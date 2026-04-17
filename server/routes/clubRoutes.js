const router = require("express").Router();
const User = require("../models/User");
const Event = require("../models/Event");
const Gallery = require("../models/Gallery");
const Club = require("../models/Club");
const Notification = require("../models/Notification");
const multer = require("multer");
const path = require("path");

// ============================
// GET ALL CLUBS
// ============================
router.get("/", async (req, res) => {
  try {
    const clubs = await Club.find({ status: "Active" });

    res.json(clubs);
  } catch {
    res.status(500).json({ message: "Error fetching clubs" });
  }
});

// ============================
// CLUB STATS
// ============================
router.get("/:clubId/stats", async (req, res) => {
  try {
    const clubId = req.params.clubId;

    const members = await User.countDocuments({
      clubId,
      role: "Student"
    });

    const events = await Event.countDocuments({ club: clubId });
    const gallery = await Gallery.countDocuments({ club: clubId });

    const pendingEvents = await Event.find({
      club: clubId,
      pendingParticipants: { $exists: true, $not: { $size: 0 } }
    });

    let pendingApprovals = 0;
    pendingEvents.forEach(e => {
      pendingApprovals += e.pendingParticipants.length;
    });

    const club = await Club.findById(clubId);

    res.json({
      clubName: club?.name || "Club",
      members,
      events,
      gallery,
      pendingApprovals
    });

  } catch {
    res.status(500).json({ message: "Stats failed" });
  }
});

// ============================
// JOIN CLUB (MULTI CLUB FIX)
// ============================
router.post("/students/join-club", async (req, res) => {
  try {
    const { userId, clubId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ LIMIT: max 2 clubs
    if (user.joinedClubs.length >= 2) {
      return res.status(400).json({
        message: "You can only join maximum 2 clubs"
      });
    }

    // ✅ SAFE duplicate check
    const alreadyJoined = user.joinedClubs.some(
      c => c.toString() === clubId
    );

    if (alreadyJoined) {
      return res.status(400).json({
        message: "Already joined this club"
      });
    }

    // ✅ ADD CLUB
    user.joinedClubs.push(clubId);
    await user.save();

    // ✅ UPDATE CLUB COUNT
    await Club.findByIdAndUpdate(clubId, {
      $inc: { membersCount: 1 }
    });

    res.json({ message: "Joined successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Join failed" });
  }
});

// ============================
// GET MEMBERS
// ============================
router.get("/:clubId/members", async (req, res) => {
  try {
    const members = await User.find({
      joinedClubs: req.params.clubId,
      role: "Student"
    }).select(`
      name
      email
      roll
      clubRole
      volunteerClub
      volunteerRole
      assignedTask
      taskDeadline
      taskStatus
    `);

    res.json(members);
  } catch {
    res.status(500).json({ message: "Error fetching members" });
  }
});

// ============================
// NOTIFICATIONS
// ============================
router.get('/notifications/:clubId', async (req, res) => {
  try {
    const notifications = await Notification.find({
      club: req.params.clubId
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch {
    res.status(500).json({ message: "Failed to load notifications" });
  }
});

// PUT /club/update-role/:userId

// PUT /club/update-role/:userId

// ============================
// UPDATE MEMBER ROLE
// ============================
router.put("/update-role/:userId", async (req, res) => {
  try {
    const { role, clubId } = req.body;
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role === "Volunteer") {
      user.clubRole = "Volunteer";
      user.clubId = clubId;          // ✅ important
      user.volunteerClub = clubId;  // optional
    } else if (role === "Member") {
      user.clubRole = "Member";
      user.clubId = clubId;
      user.volunteerClub = null;
    }

    await user.save();

    res.json({ message: "Updated", user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ============================
// REMOVE MEMBER
// ============================
router.put("/remove-member/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    user.clubId = null;
    user.clubRole = "Member";
    user.volunteerClub = null;

    await user.save();

    res.json({ message: "Removed from club" });

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

// ============================
// MULTER CONFIG
// ============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ============================
// UPLOAD CLUB BANNER
// ============================
router.post("/:clubId/upload-banner", upload.single("banner"), async (req, res) => {
  try {
    const clubId = req.params.clubId;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const bannerUrl = `/uploads/${req.file.filename}`;

    const updatedClub = await Club.findByIdAndUpdate(
      clubId,
      { banner: bannerUrl },
      { new: true }
    );

    res.json({
      message: "Banner uploaded successfully",
      banner: bannerUrl,
      club: updatedClub
    });

  } catch (err) {
    console.error("Banner upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

router.post('/create-club', async (req, res) => {
  try {
    const club = new Club(req.body);
    await club.save();
    res.status(201).json(club);
  } catch (err) {
    res.status(500).json({ message: "Error creating club" });
  }
});

// assign task to volunteer 
router.put('/assign-task/:id', async (req, res) => {
  const members = await User.find({
    joinedClubs: req.params.clubId
  }).select(
    'name email clubRole volunteerClub volunteerRole assignedTask taskDeadline taskStatus'
  );

  res.json(members);
});


// router.get("/club-volunteers/:clubId", async (req, res) => {
//   try {
//     const clubId = new mongoose.Types.ObjectId(req.params.clubId);

//     const volunteers = await User.find({
//       volunteerClub: clubId,
//       clubRole: "Volunteer"
//     }).select("name email clubRole volunteerRole");

//     res.json(volunteers);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch volunteers" });
//   }
// });


module.exports = router;