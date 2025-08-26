const express = require('express');  
const router = express.Router();
const User = require('../models/User');
const upload = require('../middleware/upload');
const bcrypt = require('bcryptjs');

// ✅ FIRST: GET user by username
router.get('/username/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ THEN: GET user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Failed to fetch user:', err);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// PUT /api/users/:id
router.put('/:id', upload.single('profilePic'), async (req, res) => {
  try {
    // Collect allowed updates sent from your Profile editor (multipart/form-data)
    const updatedData = {};

    // Core profile fields
    if (req.body.firstName !== undefined) updatedData.firstName = req.body.firstName;
    if (req.body.lastName !== undefined) updatedData.lastName = req.body.lastName;
    if (req.body.username !== undefined) updatedData.username = req.body.username;
    if (req.body.email !== undefined) updatedData.email = req.body.email;
    if (req.body.role !== undefined) updatedData.role = req.body.role;

    // Date of birth (string -> Date)
    if (req.body.dateOfBirth !== undefined && req.body.dateOfBirth) {
      updatedData.dateOfBirth = new Date(req.body.dateOfBirth);
    }

    // Optional password
    if (req.body.password) {
      const pwd = req.body.password;
      // Enforce same policy as registration: min 8, upper, lower, digit, special
      const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
      if (!passwordPolicy.test(pwd)) {
        return res.status(400).json({
          message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
        });
      }
      updatedData.password = await bcrypt.hash(pwd, 10);
    }

    // Optional profile picture
    if (req.file) {
      updatedData.profilePic = `/uploads/profilePics/${req.file.filename}`;
    }

    // You pass :id as the username in your frontend, so find by username first
    let user = await User.findOne({ username: req.params.id });
    if (!user) {
      // fallback to Mongo _id if a direct id is ever used
      user = await User.findById(req.params.id);
    }
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updatedData },
      { new: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    console.log('Updated profilePic path:', updatedUser.profilePic);
    res.json(updatedUser);
  } catch (err) {
    console.error('Failed to update user:', err.message, err.stack);
    res.status(500).json({ message: 'Failed to update user profile' });
  }
});

module.exports = router;
