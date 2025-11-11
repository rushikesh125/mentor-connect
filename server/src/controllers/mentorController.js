const Mentor = require("../models/Mentor");
const { body, query, validationResult } = require("express-validator");


// controllers/mentorController.js
exports.applyMentor = async (req, res) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    const { university, program, graduationYear, bio } = req.body;

    // Parse expertise
    let expertise = [];
    if (req.body.expertise && Array.isArray(req.body.expertise)) {
      expertise = req.body.expertise;
    } else if (req.body["expertise[]"]) {
      expertise = Array.isArray(req.body["expertise[]"])
        ? req.body["expertise[]"]
        : [req.body["expertise[]"]];
    }

    // Convert files to base64
    const documents = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const base64 = file.buffer.toString("base64");
        documents.push({
          filename: file.originalname,
          contentType: file.mimetype,
          data: base64,
        });
      }
    }

    // Validation
    if (!university || !program || !graduationYear || expertise.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const mentor = await Mentor.create({
      user: req.user._id,
      university,
      program,
      graduationYear: parseInt(graduationYear),
      expertise,
      bio: bio || "",
      documents,
      isApproved: false,
    });

    await mentor.populate("user", "name email");

    res.status(201).json({ success: true, mentor });
  } catch (err) {
    console.error("Apply error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
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
    // Use isApproved: false (matches your model)
    const applications = await Mentor.find({ isApproved: false })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    console.error("Applications error:", error);
    res.status(500).json({ success: false, message: error.message });
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
