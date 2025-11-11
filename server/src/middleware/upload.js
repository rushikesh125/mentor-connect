// middleware/upload.js
const multer = require('multer');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

// Memory storage (temporary – files go to controller)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'), false);
  },
});

// Error handler
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
};

module.exports = { upload, handleUploadError };