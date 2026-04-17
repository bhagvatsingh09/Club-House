const express = require("express");
const router = express.Router();

const Task = require("../models/Task");
const Event = require("../models/Event");
const Attendance = require("../models/Attendance");


// ============================
// ✅ GET VOLUNTEER TASKS
// ============================
router.get("/tasks/:userId", async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.params.userId
    })
      .populate("clubs", "name") 
      .populate("eventId", "title date")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

const markAttendance = async (eventId) => {
  try {
    await API.post("/volunteer/attendance/mark", {
      eventId,
      userId: user.id
    });

    alert("Attendance marked ✅");
  } catch (err) {
    alert("Already marked");
  }
};


// ============================
// ✅ UPDATE TASK STATUS
// ============================
router.put("/task/update/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating task" });
  }
});


// ============================
// ✅ GET VOLUNTEER EVENTS
// ============================
router.get("/events/:userId", async (req, res) => {
  try {
    const events = await Event.find({
      volunteers: req.params.userId
    }).sort({ date: 1 });

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching events" });
  }
});


// ============================
// ✅ MARK ATTENDANCE
// ============================
router.post("/attendance/mark", async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    const exists = await Attendance.findOne({ eventId, userId });

    if (exists) {
      return res.status(400).json({ message: "Already marked" });
    }

    const record = new Attendance({ eventId, userId });
    await record.save();

    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error marking attendance" });
  }
});

module.exports = router;