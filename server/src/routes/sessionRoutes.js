const express = require("express");
const {
  bookSession,
  getUserSessions,
  getSessionById,
  completeSession,
  addReview,
} = require("../controllers/sessionController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.post("/book", bookSession);
router.get("/", getUserSessions);
router.get("/:id", getSessionById);
router.put("/:id/complete", completeSession);
router.post("/:id/review", addReview);

module.exports = router;
