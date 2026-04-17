const express = require('express');
const router = express.Router();

const Club = require('../models/Club');
const User = require('../models/User');
const Task = require('../models/Task');
const Media = require('../models/Media');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Galleries = require('../models/Gallery');
const Log = require("../models/Log");



router.get("/students", async (req, res) => {
  try {
    // 1. Fetch students and populate the 'joinedClubs' field from the Clubs collection
    const students = await User.find({ role: "Student" })
      .select("name email joinedClubs")
      .populate("joinedClubs", "name");

    // 2. Format the response
    const formattedData = students.map(s => ({
      _id: s._id,
      name: s.name,
      email: s.email,
      // Map the populated objects to just get the names
      clubs: s.joinedClubs.map(club => club.name)
    }));

    res.json(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching students with clubs" });
  }
});

// ============================
// CREATE CLUB
// ============================
router.post('/create-club', async (req, res) => {
  try {

    const { name, description, category } = req.body;

    const newClub = new Club({
      name,
      description,
      category
    });

    const savedClub = await newClub.save();

    res.status(201).json(savedClub);

  } catch (err) {

    res.status(500).json({
      message: "Error creating club",
      error: err.message
    });

  }
});


// ============================
// GET ALL CLUBS
// ============================
router.get('/all-clubs', async (req, res) => {
  try {

    const clubs = await Club.find()
      .populate('headCoordinator', 'name email');

    res.json(clubs);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }
});


// ============================
// GET ALL FACULTIES
// ============================
router.get('/faculty-coordinators', async (req, res) => {
  try {

    const faculties = await User.find({ role: 'Faculty' })
      .populate('clubId', 'name');

    const facultyData = faculties.map(f => ({
      _id: f._id,
      name: f.name,
      email: f.email,
      isAssigned: !!f.clubId,
      clubName: f.clubId ? f.clubId.name : null
    }));

    res.json(facultyData);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }
});

// ============================
// GET ALL VOLUNTEERS
// ============================
router.get("/volunteers", async (req, res) => {
  try {
    const volunteers = await User.find({
      clubRole: "Volunteer"
    }).populate("clubId", "name");

    const volunteersWithEvents = await Promise.all(
      volunteers.map(async (v) => {
        const events = await Event.find({
          volunteers: v._id
        }).select("title");

        return {
          ...v.toObject(),
          assignedEvents: events || []
        };
      })
    );

    res.json(volunteersWithEvents);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


// ============================
// ASSIGN FACULTY HEAD
// ============================
router.put('/assign-head/:clubId', async (req, res) => {
  try {

    const { facultyId } = req.body;
    const { clubId } = req.params;

    const updatedClub = await Club.findByIdAndUpdate(
      clubId,
      { headCoordinator: facultyId },
      { new: true }
    ).populate('headCoordinator', 'name email');

    if (!updatedClub) {
      return res.status(404).json({ message: "Club not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      facultyId,
      { clubId: clubId },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.json({
      message: "Assignment successful",
      club: updatedClub
    });

  } catch (err) {

    res.status(500).json({
      message: "Assignment failed: " + err.message
    });

  }
});
// ============================
// REMOVE FACULTY HEAD
// ============================
router.put('/remove-head/:clubId', async (req, res) => {
  try {

    const { clubId } = req.params;

    // Find club
    const club = await Club.findById(clubId);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const facultyId = club.headCoordinator;

    // Remove head from club
    club.headCoordinator = null;
    await club.save();

    // Remove club from faculty user
    if (facultyId) {
      await User.findByIdAndUpdate(
        facultyId,
        { clubId: null }
      );
    }

    res.json({
      message: "Faculty head removed successfully"
    });

  } catch (err) {

    res.status(500).json({
      message: "Failed to remove head"
    });

  }
});

// REMOVE VOLUNTEER FROM SYSTEM
router.delete("/volunteer/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const Event = require("../models/Event");

    // remove from all events
    await Event.updateMany(
      { volunteers: userId },
      { $pull: { volunteers: userId } }
    );

    // ✅ CHANGE ROLE
    await User.findByIdAndUpdate(userId, {
      clubRole: "Member"
    });

    res.json({ message: "Volunteer removed successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// make member to volunteer
// ====================
// router.post("/make-volunteer/:id", async (req, res) => {
//   try {
//     await User.findByIdAndUpdate(req.params.id, {
//       isVolunteer: true
//     });

//     res.json({ message: "User promoted to volunteer" });
//   } catch (err) {
//     res.status(500).json({ message: "Server Error" });
//   }
// });

// ============================
// ISSUE TASK
// ============================
router.post('/issue-task', async (req, res) => {
  try {
    const { clubId, directive, deadline, priority } = req.body;

    const responses = clubId.map(id => ({
      club: id,
      status: 'Pending'
    }));

    const newTask = new Task({
      clubs: clubId,
      directive,
      deadline,
      priority,
      responses
    });

    await newTask.save();

    res.json(newTask);
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
});


// ============================
// GET ALL TASKS
// ============================
router.get('/all-tasks', async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('clubs', 'name')   // ✅ FIX
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error(err);   
    res.status(500).json({ message: err.message });
  }
});


// ============================
// DELETE TASK
// ============================
router.delete('/delete-task/:id', async (req, res) => {
  try {

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: "Task removed" });

  } catch (err) {

    res.status(500).json({
      message: "Error deleting task"
    });

  }
});

// ============================
// GET TASKS FOR FACULTY (BY CLUB)
// ============================
router.get('/faculty/tasks/:clubId', async (req, res) => {
  try {
    const tasks = await Task.find({
      clubs: req.params.clubId
    })
    .populate('clubs', 'name');

    res.json(tasks);
  } catch (err) {
    console.error(err);   // 👈 VERY IMPORTANT
    res.status(500).json({ message: err.message });
  }
});
// =====================
// accept or reject task
// =====================
router.put('/faculty/task-response', async (req, res) => {
  try {
    const { taskId, clubId, status, reason } = req.body;

    console.log("DATA:", { taskId, clubId, status, reason });

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!task.responses || task.responses.length === 0) {
      return res.status(400).json({ message: "No responses in task" });
    }

    const response = task.responses.find(r => {
      return String(r.club) === String(clubId);   // ✅ SAFE COMPARISON
    });

    if (!response) {
      return res.status(404).json({ message: "Response not found for this club" });
    }

    response.status = status;
    response.reason = reason || "";

    await task.save();

    res.json({ message: "Updated successfully" });

  } catch (err) {
    console.error("🔥 RESPONSE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ============================
// ADMIN: GALLERY OVERVIEW
// ============================
router.get('/gallery/overview', async (req, res) => {
  try {
    const clubs = await Club.find({});

    const result = await Promise.all(
      clubs.map(async (club) => {

        const media = await Galleries.find({ clubId: club._id });

        const imageCount = media.filter(m => m.type === "image").length;
        const videoCount = media.filter(m => m.type === "video").length;

        return {
          _id: club._id,
          name: club.name,
          banner: club.banner || club.image,
          imageCount,
          videoCount
        };
      })
    );

    res.json(result);

  } catch (err) {
    console.error("Overview error:", err);
    res.status(500).json({ message: "Failed to load overview" });
  }
});

// get gallary media for landing page
router.get('/gallery/featured', async (req, res) => {
  console.log("🔥 FEATURED ROUTE HIT");

  try {
    const media = await Galleries.find({ isFeatured: true });
    res.json(media);
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
});

// ============================
// ADMIN: GET CLUB MEDIA
// ============================
router.get('/gallery/:clubId', async (req, res) => {
  try {
    const media = await Galleries.find({ clubId: req.params.clubId })
      .sort({ createdAt: -1 });

    res.json(media);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch media" });
  }
});


// ============================
// ADMIN: DELETE MEDIA
// ============================
router.delete('/gallery/media/:id', async (req, res) => {
  try {
    await Galleries.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
});

// ============================
// ADMIN DASHBOARD STATS
// ============================
router.get('/dashboard-stats', async (req, res) => {
  try {

    const totalStudents = await User.countDocuments({ role: "Student" });

    const totalClubs = await Club.countDocuments();

    const totalEvents = await Event.countDocuments();

    const events = await Event.find();

    let totalRegistrations = 0;

    events.forEach(event => {
      totalRegistrations += event.participants?.length || 0;
    });

    res.json({
      totalStudents,
      totalClubs,
      totalEvents,
      totalRegistrations
    });

  } catch (err) {

    res.status(500).json({
      message: "Failed to load dashboard stats"
    });

  }
});



// ============================
// ADMIN - GET ALL APPROVED STUDENTS
// ============================
router.get("/approved-students", async (req, res) => {

  try {

    const events = await Event.find({})
      .populate("participants", "name email")
      .populate("club", "name");

    let students = [];

    events.forEach(event => {

      if (!event.participants || event.participants.length === 0) return;

      event.participants.forEach(student => {

        students.push({
          studentId: student._id,
          name: student.name,
          email: student.email,
          clubName: event.club?.name,
          eventName: event.title,
          eventId: event._id
        });

      });

    });

    res.json(students);

  } catch (err) {

    console.error("Approved students error:", err);

    res.status(500).json({
      message: "Server error"
    });

  }

});


// routes/adminRoutes.js


router.get("/logs", async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error("LOG FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

// get club details

router.get("/club-details/:clubId", async (req, res) => {
  try {
    
    const clubId = req.params.clubId;

  
    // ✅ GET CLUB
   const club = await Club.findById(clubId)
  .populate('headCoordinator', 'name email');


    // ✅ GET MEMBERS (IMPORTANT FIX)
    const members = await User.find({
      joinedClubs: clubId,
      role: "Student"
    }).select("name email roll clubRole");

    // ✅ GET EVENTS
    const events = await Event.find({ club: clubId })
      .select("title date");

    res.json({
      ...club.toObject(),
      members,
      events
    });

  } catch (err) {
    console.error("Club details error:", err);
    res.status(500).json({ message: "Failed to fetch club details" });
  }
});

// delete club
router.delete('/delete-club/:id', async (req, res) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    res.json({ message: "Club deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// update club
router.put('/update-club/:id', async (req, res) => {
  try {
    const club = await Club.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(club);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

// get all events
router.get("/all-events", async (req, res) => {
  try {
    const events = await Event.find({})
      .populate("participants", "name email")
      .populate('club', 'name')
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// ⭐ TOGGLE FEATURED (LIKE)
router.put('/gallery/feature/:id', async (req, res) => {
  try {
    const media = await Galleries.findById(req.params.id);

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    // toggle true/false
    media.isFeatured = !media.isFeatured;
    await media.save();

    res.json(media);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update" });
  }
});

// ============================
// 🔁 TOGGLE VOLUNTEER ROLE
// ============================
router.put("/toggle-volunteer/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle Member ↔ Volunteer
    user.clubRole =
      user.clubRole === "Volunteer" ? "Member" : "Volunteer";

    await user.save();

    res.json({
      message: "Role updated successfully",
      clubRole: user.clubRole
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;