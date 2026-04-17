const router = require("express").Router();
const Attendance = require("../models/Attendance");

console.log("✅ Attendance route loaded");

// MARK ATTENDANCE
router.post("/mark", async (req, res) => {
  try {
    const { eventId, userId } = req.body;

    const already = await Attendance.findOne({
      eventId,
      userId
    });

    if (already) {
      return res.status(400).json({ message: "Already marked" });
    }

    await Attendance.create({
      eventId,
      userId,
      status: "Present"
    });

    res.json({ message: "Attendance marked" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed" });
  }
});

// GET USER ATTENDANCE
// router.get("/:userId", async (req, res) => {
//   try {
//     const data = await Attendance.find({
//       userId: req.params.userId
//     });

//     res.json(data);

//   } catch (err) {
//     res.status(500).json({ message: "Failed" });
//   }
// });

// GET ALL ATTENDANCE
router.get("/all", async (req, res) => {
  try {
    const data = await Attendance.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const data = await Attendance.find({
      userId: req.params.userId
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed" });
  }
});

module.exports = router;