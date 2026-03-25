const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const Gallery = require('../models/Gallery');

// --- MULTER SETUP (Local Storage) ---
// Note: For production, consider changing this to use Cloudinary or AWS S3
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure you have an 'uploads' folder in your server root!
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 1. GET: Fetch all media for a club
router.get('/club/:clubId', async (req, res) => {
  try {
    const media = await Gallery.find({ clubId: req.params.clubId }).sort({ createdAt: -1 });
    // console.log("Fetching media for club:", req.params.clubId);
    res.json(media);
  } catch (err) {
    res.status(500).json({ message: "Error fetching gallery" });
  }
});

// 2. POST: Upload new media
router.post('/club/:clubId/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, eventId } = req.body; // Extract eventId from body
    const isVideo = req.file.mimetype.startsWith('video/');
    
    const newMedia = new Gallery({
      clubId: req.params.clubId,
      eventId: eventId || null, // Link to event if provided
      title: title,
      type: isVideo ? 'video' : 'image',
      url: `/uploads/${req.file.filename}`
    });

    await newMedia.save();
    res.status(201).json(newMedia);
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
});

// 3. DELETE: Remove media
router.delete('/:id', async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    // Note: In a complete app, you'd also delete the physical file from the 'uploads' folder here using fs.unlinkSync
    res.json({ message: "Media deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// ============================
// GET MEDIA OF A CLUB
// ============================
// router.get("/:clubId", async (req, res) => {
//   try {
//     const media = await Gallery.find({ clubId: req.params.clubId })
//       .sort({ createdAt: -1 });

//     res.json(media);

//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch media" });
//   }
// });

module.exports = router;