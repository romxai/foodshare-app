const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createListing } = require('../controllers/listingController');

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/food_images',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
}).single('image');

// Upload route
router.post('/food/listing', (req, res) => { // Ensure the path matches the fetch request
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    } else {
      try {
        const imageUrl = `/uploads/food_images/${req.file.filename}`;
        const listingData = { ...req.body, image: imageUrl };
        await createListing(listingData);
        return res.status(201).json({ message: 'Food listing created', imageUrl });
      } catch (error) {
        return res.status(500).json({ error: 'Failed to create listing' });
      }
    }
  });
});

module.exports = router;
