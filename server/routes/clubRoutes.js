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

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.joinedClubs.includes(clubId)) {
      return res.status(400).json({ message: "Already joined" });
    }

    user.joinedClubs.push(clubId);
    await user.save();

    await Club.findByIdAndUpdate(clubId, {
      $inc: { membersCount: 1 }
    });

    res.json({ message: "Joined successfully" });

  } catch {
    res.status(500).json({ message: "Join failed" });
  }
});

// ============================
// GET MEMBERS
// ============================
router.get("/:clubId/members", async (req, res) => {
  try { 
    const members = await User.find({
      joinedClubs : req.params.clubId,
      role: "Student"
    }).select("name email roll clubRole");

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
    const { role } = req.body;
    const { userId } = req.params;
    const clubId = req.user?.clubId;

    console.log("Updating role:", { userId, role, clubId });

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (role === "Volunteer") {
      if (user.volunteerClub && user.volunteerClub.toString() !== clubId) {
        return res.status(400).json({
          message: `User is already a volunteer in another club`
        });
      }
      user.clubRole = "Volunteer";
      user.volunteerClub = clubId;
    }
    else if (role === "Member") {
      user.clubRole = "Member";
      if (user.volunteerClub?.toString() === clubId) user.volunteerClub = null;
    }
    else {
      return res.status(400).json({ message: "Invalid role value" });
    }

    await user.save();
    return res.json({ message: "Role updated", user });
  } catch (err) {
    console.error("Error updating role:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
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



module.exports = router;