const express = require('express');
const FoodListing = require('../models/FoodListing');
const { protect } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads/food_images',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
}).single('image');

// Create a new food listing
router.post('/listing', protect, (req, res) => {
  console.log("Received request to create listing");
  upload(req, res, async (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({ message: 'Error uploading file' });
    }
    try {
      console.log("Request body:", req.body);
      console.log("File:", req.file);
      const { foodType, description, quantity, expirationDate, expirationTime, location } = req.body;
      const expiration = new Date(`${expirationDate}T${expirationTime}`);
      const imageUrl = req.file ? `/uploads/food_images/${req.file.filename}` : null;

      const newListing = new FoodListing({
        foodType,
        description,
        quantity,
        expiration,
        location,
        image: imageUrl,
        postedBy: req.user.id
      });
      console.log("New listing object:", newListing);
      await newListing.save();
      console.log("Listing saved successfully");
      res.status(201).json(newListing);
    } catch (error) {
      console.error('Error creating food listing:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
});

// Get all food listings except the user's own
router.get('/', async (req, res) => {
  try {
    const { userId, search, ...advancedParams } = req.query;
    
    let query = { postedBy: { $ne: userId } };

    if (search) {
      query.$or = [
        { foodType: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Add advanced search parameters to the query
    Object.keys(advancedParams).forEach(key => {
      if (advancedParams[key]) {
        query[key] = advancedParams[key];
      }
    });

    const listings = await FoodListing.find(query).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error('Error fetching food listings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
