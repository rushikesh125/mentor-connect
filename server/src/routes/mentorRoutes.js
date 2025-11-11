// routes/mentorRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const {
  applyMentor,
  getAllMentors,
  getMentorById,
  updateMentorProfile,
  setAvailability,
  getMentorApplications,
  approveMentor,
} = require("../controllers/mentorController");

const { protect, authorize } = require("../middleware/auth");
const { upload, handleUploadError } = require("../middleware/upload");
const { gridfsBucket } = require("../config/db"); // Import gfs from db
const { MongoClient, ObjectId } = require("mongodb"); // Add ObjectId import
const router = express.Router();

// ── ADMIN ROUTES ─────────────────────────────────────
router.get("/applications", protect, authorize("admin"), getMentorApplications);
router.put("/applications/:id/approve", protect, authorize("admin"), approveMentor);

// ── PUBLIC ROUTES ─────────────────────────────────────
router.get("/", getAllMentors);
router.get("/:id", getMentorById);

// ── FILE VIEWER ─────────────
router.get("/document/:mentorId/:index", async (req, res) => {
  try {
    const { mentorId, index } = req.params;
    const idx = parseInt(index);

    const mentor = await Mentor.findById(mentorId);
    if (!mentor || !mentor.documents[idx]) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    const file = mentor.documents[idx];
    const dataUri = `data:${file.contentType};base64,${file.data}`;

    res.send(`
      <!DOCTYPE html>
      <html><body style="margin:0">
        <iframe src="${dataUri}" style="width:100%;height:100vh;border:none"></iframe>
      </body></html>
    `);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PROTECTED ROUTES ───────────────────────────────────
router.post(
  "/apply",
  protect,
  upload.array("documents", 5),
  handleUploadError,
  applyMentor
);

router.put("/:id", protect, updateMentorProfile);
router.post("/:id/availability", protect, setAvailability);

module.exports = router;