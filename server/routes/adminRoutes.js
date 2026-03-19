const express = require('express');
const router = express.Router();

const Club = require('../models/Club');
const User = require('../models/User');
const Task = require('../models/Task');
const Media = require('../models/Media');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

router.get("/students", async (req, res) => {
  try {

    const registrations = await Registration.find()
      .populate("userId", "name email studentId")
      .populate("clubId", "name")
      .populate("eventId", "title");

    const students = registrations.map(r => ({
      name: r.userId?.name,
      email: r.userId?.email,
      studentId: r.userId?.studentId,
      clubName: r.clubId?.name,
      eventName: r.eventId?.title
    }));

    res.json(students);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching students" });
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
router.get('/faculties', async (req, res) => {
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


// ============================
// ISSUE TASK
// ============================
router.post('/issue-task', async (req, res) => {
  try {

    const { clubId, directive, deadline, priority } = req.body;

    const newTask = new Task({
      club: clubId,
      directive,
      deadline,
      priority
    });

    await newTask.save();

    res.status(201).json(newTask);

  } catch (err) {

    res.status(500).json({
      message: "Failed to issue task"
    });

  }
});


// ============================
// GET ALL TASKS
// ============================
router.get('/all-tasks', async (req, res) => {
  try {

    const tasks = await Task.find()
      .populate('club', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);

  } catch (err) {

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
// GALLERY OVERVIEW
// ============================
router.get('/gallery/overview', async (req, res) => {
  try {

    const clubs = await Club.find().select('name');

    const overview = await Promise.all(

      clubs.map(async (club) => {

        const images = await Media.countDocuments({
          club: club._id,
          type: 'image'
        });

        const videos = await Media.countDocuments({
          club: club._id,
          type: 'video'
        });

        const lastMedia = await Media
          .findOne({ club: club._id, type: 'image' })
          .sort({ createdAt: -1 });

        return {
          _id: club._id,
          name: club.name,
          imageCount: images,
          videoCount: videos,
          cover: lastMedia
            ? lastMedia.url
            : 'https://placehold.co/400x300/050a18/white?text=No+Media'
        };

      })

    );

    res.json(overview);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }
});


// ============================
// GET CLUB MEDIA
// ============================
router.get('/gallery/:clubId', async (req, res) => {
  try {

    const media = await Media.find({
      club: req.params.clubId
    }).sort({ createdAt: -1 });

    res.json(media);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }
});


// ============================
// DELETE MEDIA
// ============================
router.delete('/gallery/media/:mediaId', async (req, res) => {
  try {

    await Media.findByIdAndDelete(req.params.mediaId);

    res.json({ message: "Asset deleted" });

  } catch (err) {

    res.status(500).json({
      message: "Deletion failed"
    });

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




module.exports = router;