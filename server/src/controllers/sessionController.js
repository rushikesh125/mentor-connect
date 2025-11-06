const Session = require("../models/Session");
const Mentor = require("../models/Mentor");
const Review = require("../models/Review");
const { body, param, validationResult } = require("express-validator");

exports.bookSession = [
  body("mentorId").isMongoId().withMessage("Valid mentor ID required"),
  body("startTime").isISO8601().withMessage("Valid start time required"),
  body("endTime")
    .isISO8601()
    .withMessage("Valid end time required")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),
  body("topic")
    .trim()
    .notEmpty()
    .withMessage("Topic required")
    .isLength({ max: 200 })
    .withMessage("Topic too long"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },

  async (req, res) => {
    try {
      const { mentorId, startTime, endTime, topic } = req.body;

      const mentor = await Mentor.findById(mentorId);
      if (!mentor || !mentor.isApproved) {
        return res
          .status(404)
          .json({ success: false, message: "Mentor not found" });
      }

      const isAvailable = mentor.availability.some(
        (slot) =>
          new Date(slot.start) <= new Date(startTime) &&
          new Date(slot.end) >= new Date(endTime)
      );
      if (!isAvailable) {
        return res
          .status(400)
          .json({ success: false, message: "Slot not available" });
      }

      const session = await Session.create({
        mentor: mentorId,
        mentee: req.user._id,
        startTime,
        endTime,
        topic,
        videoLink: `https://zoom.us/j/${Date.now()}`,
      });

      res.status(201).json({ success: true, session });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
];

exports.getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ mentee: req.user._id }, { mentor: req.user.mentor }],
    })
      .populate("mentor", "user university")
      .populate("mentee", "name");

    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate(
      "mentor mentee",
      "name email"
    );

    if (
      !session ||
      (session.mentee._id.toString() !== req.user._id.toString() &&
        session.mentor.toString() !== req.user.mentor?.toString())
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }
    if (session.mentor.toString() !== req.user.mentor?.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Only mentor can complete" });
    }

    session.status = "completed";
    await session.save();

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addReview = [
  param("id").isMongoId().withMessage("Valid session ID required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1–5"),
  body("comment")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Comment too long"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },

  async (req, res) => {
    try {
      const session = await Session.findById(req.params.id);
      if (!session || session.status !== "completed") {
        return res
          .status(400)
          .json({ success: false, message: "Session not completed" });
      }

      const existing = await Review.findOne({
        session: req.params.id,
        reviewer: req.user._id,
      });
      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: "Already reviewed" });
      }

      const review = await Review.create({
        session: req.params.id,
        reviewer: req.user._id,
        rating: req.body.rating,
        comment: req.body.comment,
      });

      // Update mentor rating
      const mentor = await Mentor.findById(session.mentor);
      const reviews = await Review.find({ session: { $in: mentor.reviews } });
      const avg =
        reviews.reduce((a, r) => a + r.rating, 0) / reviews.length || 0;
      mentor.rating = avg;
      mentor.totalReviews = reviews.length;
      await mentor.save();

      res.status(201).json({ success: true, review });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
];
