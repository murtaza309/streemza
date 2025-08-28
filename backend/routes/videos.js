const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const upload = require('../middleware/upload'); // multer middleware
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const User = require('../models/User');

const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

// ⚡ Setup Azure Blob client
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER);

// POST /api/videos/upload
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const { title, publisher, genre, ageRating, creatorId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    // 👉 Upload file buffer to Azure Blob
    const blobName = `${Date.now()}-${req.file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

    // 👉 Public URL for the video
    const videoUrl = blockBlobClient.url;

    // 👉 Save metadata in MongoDB
    const video = new Video({
      title,
      publisher,
      genre,
      ageRating,
      videoUrl, // Azure URL instead of local
      creator: new mongoose.Types.ObjectId(creatorId)
    });

    await video.save();

    res.status(201).json({
      message: 'Video uploaded successfully',
      video
    });

  } catch (err) {
    console.error('❌ Upload failed:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// GET /api/videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .populate('creator', 'username email');

    res.status(200).json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
});

// GET /api/videos/:id
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('creator', 'username email');
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.status(200).json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch video' });
  }
});

// PUT /api/videos/views/:id
router.put('/views/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json({ message: 'View count updated', views: video.views });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update views' });
  }
});

// POST /api/videos/:id/comments
router.post('/:id/comments', async (req, res) => {
  try {
    const { text, userId } = req.body;
    const videoId = req.params.id;

    if (!text || !userId) {
      return res.status(400).json({ message: 'Comment text and user ID are required' });
    }

    const comment = new Comment({
      text,
      user: userId,
      video: videoId
    });

    await comment.save();

    // 🔔 Notify video creator if commenter is not the owner
    const video = await Video.findById(videoId);
    if (video.creator.toString() !== userId) {
      const commenter = await User.findById(userId);
      if (commenter) {
        const message = `💬 ${commenter.username} commented on your video: "${video.title}"`;
        await Notification.create({
          user: video.creator,
          message,
        });
      }
    }

    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to post comment' });
  }
});

// GET /api/videos/:id/comments
router.get('/:id/comments', async (req, res) => {
  try {
    const videoId = req.params.id;

    const comments = await Comment.find({ video: videoId })
      .sort({ createdAt: -1 })
      .populate('user', 'username email');

    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// POST /api/videos/:id/like
router.post('/:id/like', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    const { userId } = req.body;

    if (!video.likes.includes(userId)) {
      video.likes.push(userId);
      video.unlikes = video.unlikes.filter(id => id.toString() !== userId);
      await video.save();

      // 🔔 Notify video creator if liker is not the owner
      if (video.creator.toString() !== userId) {
        const liker = await User.findById(userId);
        if (liker) {
          const message = `👍 ${liker.username} liked your video: "${video.title}"`;
          await Notification.create({
            user: video.creator,
            message,
          });
        }
      }
    }

    res.status(200).json({ message: 'Liked the video', likes: video.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to like video' });
  }
});

// POST /api/videos/:id/unlike
router.post('/:id/unlike', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    const { userId } = req.body;

    if (!video.unlikes.includes(userId)) {
      video.unlikes.push(userId);
      video.likes = video.likes.filter(id => id.toString() !== userId);
      await video.save();
    }

    res.status(200).json({ message: 'Unliked the video', unlikes: video.unlikes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to unlike video' });
  }
});

module.exports = router;
