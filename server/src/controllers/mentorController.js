const Mentor = require("../models/Mentor");
const { body, query, validationResult } = require("express-validator");

exports.applyMentor = [
  body("university").trim().notEmpty().withMessage("University is required"),
  body("program").trim().notEmpty().withMessage("Program is required"),
  body("graduationYear")
    .isInt({ min: 1950, max: 2030 })
    .withMessage("Valid graduation year required"),
  body("expertise")
    .isArray({ min: 1 })
    .withMessage("At least one expertise required"),
  body("bio")
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage("Bio must be 50–1000 characters"),
  body("documents")
    .optional()
    .isArray()
    .withMessage("Documents must be URLs array"),

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
      const existing = await Mentor.findOne({ user: req.user._id });
      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: "Already applied" });
      }

      const mentor = await Mentor.create({
        user: req.user._id,
        university: req.body.university,
        program: req.body.program,
        graduationYear: req.body.graduationYear,
        expertise: req.body.expertise,
        bio: req.body.bio,
        documents: req.body.documents || [],
        isApproved: false,
      });

      res.status(201).json({ success: true, mentor });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
];

exports.getAllMentors = [
  query("university").optional().trim(),
  query("program").optional().trim(),
  query("expertise").optional().trim(),
  query("availableThisWeek").optional().isBoolean(),

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
      const { university, program, expertise, availableThisWeek } = req.query;
      const query = { isApproved: true };

      if (university) query.university = new RegExp(university, "i");
      if (program) query.program = new RegExp(program, "i");
      if (expertise) query.expertise = { $in: [new RegExp(expertise, "i")] };
      if (availableThisWeek === "true") {
        const start = new Date();
        const end = new Date();
        end.setDate(start.getDate() + 7);
        query["availability.start"] = { $gte: start, $lte: end };
      }

      const mentors = await Mentor.find(query)
        .populate("user", "name email profilePhoto")
        .select("-documents");

      res.json({ success: true, count: mentors.length, mentors });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
];

exports.getMentorById = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id)
      .populate("user", "name email profilePhoto")
      .populate({
        path: "reviews",
        populate: { path: "reviewer", select: "name" },
      });

    if (!mentor || !mentor.isApproved) {
      return res
        .status(404)
        .json({ success: false, message: "Mentor not found" });
    }

    res.json({ success: true, mentor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMentorProfile = [
  body("university").optional().trim(),
  body("program").optional().trim(),
  body("bio").optional().trim().isLength({ max: 1000 }),

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
      const mentor = await Mentor.findOne({
        _id: req.params.id,
        user: req.user._id,
      });
      if (!mentor) {
        return res
          .status(404)
          .json({ success: false, message: "Mentor not found" });
      }

      Object.assign(mentor, req.body);
      await mentor.save();

      res.json({ success: true, mentor });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
];

exports.setAvailability = [
  body("slots").isArray({ min: 1 }).withMessage("At least one slot required"),

  body("slots.*.start").isISO8601().withMessage("Valid start time required"),
  body("slots.*.end")
    .isISO8601()
    .withMessage("Valid end time required")
    .custom((end, { req, path }) => {
      const idx = path.match(/\d+/)[0];
      const start = req.body.slots[idx].start;
      if (new Date(end) <= new Date(start)) {
        throw new Error("End must be after start");
      }
      return true;
    }),

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
      const mentor = await Mentor.findOne({
        _id: req.params.id,
        user: req.user._id,
      });
      if (!mentor) {
        return res
          .status(404)
          .json({ success: false, message: "Mentor not found" });
      }

      mentor.availability = req.body.slots;
      await mentor.save();

      res.json({ success: true, availability: mentor.availability });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
];

exports.getMentorApplications = async (req, res) => {
  try {
    const applications = await Mentor.find({ isApproved: false }).populate(
      "user",
      "name email"
    );
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);
    if (!mentor) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    mentor.isApproved = true;
    await mentor.save();

    res.json({ success: true, message: "Mentor approved" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
