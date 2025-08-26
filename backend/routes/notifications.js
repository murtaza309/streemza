const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User'); // ✅ Added

// GET /api/notifications/:userId (now userId = username)
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.userId }); // ✅ Resolve username to _id
    if (!user) return res.status(404).json({ message: 'User not found' });

    const notifications = await Notification.find({ user: user._id }) // ✅ Use user._id
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load notifications' });
  }
});

module.exports = router;
