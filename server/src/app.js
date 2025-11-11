const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { multerErrorHandler } = require("./middleware/upload");
const { connectDB } = require("./config/db");

dotenv.config();

const app = express();
connectDB()
// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // specify the exact origin
  credentials: true                // allow cookies/auth headers
}));
app.use(cookieParser());
app.use(express.json());                    // ← PARSES JSON
app.use(express.urlencoded({ extended: true })); // ← PARSES FormData text
// app.use(multerErrorHandler);

// === Mount ALL Routes BEFORE 404 ===
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/files", require("./routes/fileRoutes"));
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
