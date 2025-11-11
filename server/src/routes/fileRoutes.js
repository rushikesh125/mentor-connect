// routes/fileRoutes.js
const express = require("express");
const Grid = require("gridfs-stream");
const mongoose = require("mongoose");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Init gfs
let gfs;
let gridfsBucket;
mongoose.connection.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "mentor-documents" });
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection("mentor-documents");
});

// Serve file
router.get("/documents/:filename", async (req, res) => {
  try {
    const file = await gridfsBucket.find({ filename: req.params.filename }).toArray();
    if (file.length === 0) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    const readstream = gridfsBucket.openDownloadStreamByName(req.params.filename);
    res.set("Content-Type", file[0].contentType || "application/pdf");
    readstream.pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;