const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middlewares/auth");
const bcrypt = require("bcryptjs");

const router = express.Router();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Signup route
router.post("/signup", async (req, res) => {
  try {
    console.log("Received signup request:", req.body);
    const { name, email, password, location, phoneNumber } = req.body;

    if (!name || !email || !password || !location || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("Hashed password during signup:", hashedPassword);

    const user = new User({ name, email, password: hashedPassword, location, phoneNumber });

    await user.save();
    console.log("User created:", {
      ...user.toObject(),
      password: hashedPassword
    });
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    console.log("Received login request:", req.body);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }
    console.log("User found:", user.email);
    console.log("Stored hashed password:", user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Is password valid:", isPasswordValid);
    console.log("Entered password:", password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log("Login successful, token generated");
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get current user route
router.get("/me", protect, (req, res) => {
  res.json({ user: {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    location: req.user.location,
    phoneNumber: req.user.phoneNumber
  }});
});

// Update user profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, email, location, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (location) user.location = location;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Import the FoodListing model (you'll need to create this)
const FoodListing = require('../models/FoodListing');

// Get user activity (posts made, contact history)
router.get("/activity", protect, async (req, res) => {
  try {
    // Fetch user's food listings
    const posts = await FoodListing.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10); // Limit to the last 10 posts

    // Fetch user's contact history (this is a placeholder, you'll need to implement the actual logic)
    const contactHistory = []; // You'll need to create a Message or Contact model to store this data

    res.json({
      posts,
      contactHistory
    });
  } catch (error) {
    console.error("Fetch activity error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
