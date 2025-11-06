const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// === Mount ALL Routes BEFORE 404 ===
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/mentors", require("./routes/mentorRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "MentorConnect API v1.0 - Running!" });
});

// === 404 Handler – MUST BE LAST ===
// app.use("*", (req, res) => {
//   res.status(404).json({ success: false, message: "Route not found" });
// });

// Global Error Handler (Optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Server Error" });
});

module.exports = app;
