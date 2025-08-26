const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');

// POST /api/subscribe/:id
router.post('/:id', async (req, res) => {
  try {
    const subscriberId = req.body?.userId;
    const creatorId = req.params.id;

    if (!subscriberId) {
      return res.status(400).json({ message: 'Missing userId in body' });
    }

    if (subscriberId === creatorId) {
      return res.status(400).json({ message: 'You cannot subscribe to yourself' });
    }

    const creator = await User.findOne({ username: creatorId }); // ✅ FIXED LINE
    const subscriber = await User.findById(subscriberId);

    if (!creator || !subscriber) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!creator.subscribers.includes(subscriberId)) {
      creator.subscribers.push(subscriberId);
      await creator.save();

      // Notify the creator
      const notify = new Notification({
        user: creator._id,
        message: `${subscriber.username} subscribed to your channel`
      });
      await notify.save();
    }
    console.log("✅ Notification created for:", creator.username);


    res.status(200).json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.error('❌ Subscription error:', err);
    res.status(500).json({ message: 'Subscription failed' });
  }
});

module.exports = router;
