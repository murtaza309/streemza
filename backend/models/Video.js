// models/Video.js
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  publisher: { type: String, required: false }, // 👈 no longer required
  genre: { type: String, required: true },
  ageRating: { type: String, required: true },
  videoUrl: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  unlikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Video', videoSchema);
