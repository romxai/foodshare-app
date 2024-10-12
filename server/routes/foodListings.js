const express = require('express');
const FoodListing = require('../models/FoodListing');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Create a new food listing
router.post('/', protect, async (req, res) => {
  try {
    const { foodType, description, quantity, expiration, location } = req.body;
    const newListing = new FoodListing({
      foodType,
      description,
      quantity,
      expiration,
      location,
      postedBy: req.user.id
    });
    await newListing.save();
    res.status(201).json(newListing);
  } catch (error) {
    console.error('Error creating food listing:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all food listings
router.get('/', async (req, res) => {
  try {
    const listings = await FoodListing.find().sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error('Error fetching food listings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;