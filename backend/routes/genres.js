const express = require('express');
const router = express.Router();

// Temporary static genres (replace with DB if needed)
const genres = [
  'Comedy',
  'Drama',
  'Action',
  'Horror',
  'Romance',
  'Documentary',
  'Animation',
  'Sci-Fi',
  'Fantasy',
  'Thriller'
];

// GET /api/genres
router.get('/', (req, res) => {
  res.json(genres);
});

module.exports = router;
