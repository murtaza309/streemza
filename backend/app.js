const express = require('express');   
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const notificationRoutes = require('./routes/notifications');
const subscriptionRoutes = require('./routes/subscriptions');
const userRoutes = require('./routes/users');
const genreRoutes = require('./routes/genres'); // 👈 Add this
const sentimentRoutes = require('./routes/sentiment'); //

const app = express();

// ✅ Updated CORS to allow frontend access
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://nice-glacier-0a0775403.1.azurestaticapps.net'
  ],
  credentials: true
}));

// ✅ Moved middleware above routes
app.use(express.json());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Route handlers

app.use('/api', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/subscribe', subscriptionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/genres', genreRoutes); // 👈 Add this
app.use('/api/sentiment', sentimentRoutes); // 👈 add this

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Connected'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

app.get('/', (req, res) => {
  res.send('🎥 Streemza Backend is Live');
});

module.exports = app;
