// src/routes/mentorRoutes.js
const express = require("express");
const {
  applyMentor,
  getAllMentors,
  getMentorById,
  updateMentorProfile,
  setAvailability,
  getMentorApplications,
  approveMentor,
} = require("../controllers/mentorController");
const upload = require("../middleware/upload");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Apply as mentor (with file upload)
router.post("/apply", protect, upload.array("documents", 5), applyMentor);

// Public
router.get("/", getAllMentors);
router.get("/:id", getMentorById);

// Protected (mentor only)
router.put("/:id", protect, updateMentorProfile);
router.post("/:id/availability", protect, setAvailability);

// Admin only
router.get("/applications", protect, authorize("admin"), getMentorApplications);
router.put(
  "/applications/:id/approve",
  protect,
  authorize("admin"),
  approveMentor
);

module.exports = router;
