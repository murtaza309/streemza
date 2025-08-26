const mongoose = require('mongoose'); 

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['creator', 'consumer'],
      default: 'consumer'
    },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    profilePic: { type: String }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
