const multer = require("multer");

// Configure multer for memory storage (we'll upload to Supabase, not save to disk)
const storage = multer.memoryStorage();

// File filter to only allow JPEG images
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG images are allowed"), false);
  }
};

// Configure multer with size limit and file filter
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: fileFilter,
});

module.exports = upload;
