// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Use memory storage (no saving to disk)
const storage = multer.memoryStorage();

// Allow both image and video files
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
  
  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error('Only images and video files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 } // Max 200MB
});

module.exports = upload;
