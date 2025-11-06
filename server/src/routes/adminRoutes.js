const express = require("express");
const {
  getAllUsers,
  updateUser,
  getAllSessions,
  getAllReviews,
  deleteReview,
  getPlatformMetrics,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.get("/sessions", getAllSessions);
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);
router.get("/metrics", getPlatformMetrics);

module.exports = router;
