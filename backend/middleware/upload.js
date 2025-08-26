// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use separate folder for profile pictures
    if (file.mimetype.startsWith('image/')) {
      cb(null, 'uploads/profilePics/');
    } else {
      cb(null, 'uploads/'); // videos or other
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Allow both image and video files
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  if (extName) {
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
