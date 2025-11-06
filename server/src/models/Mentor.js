const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  university: { type: String, required: true },
  program: { type: String, required: true },
  graduationYear: { type: Number },
  expertise: [String],
  bio: String,
  hourlyRate: { type: Number, default: 0 },
  availability: [
    {
      start: Date,
      end: Date,
    },
  ],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false },
  documents: [String], // Cloudinary URLs
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Mentor", mentorSchema);
