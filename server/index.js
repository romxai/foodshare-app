require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const foodListingRoutes = require("./routes/foodListings");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debugging: Log the MONGODB_URI (make sure to redact sensitive info)
if (process.env.MONGODB_URI) {
  console.log(
    "MONGODB_URI:",
    process.env.MONGODB_URI.replace(/:([^@]+)@/, ":****@")
  );
} else {
  console.error("MONGODB_URI is not defined in the environment variables");
}

// Connect to MongoDB
mongoose.set("strictQuery", false);
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      console.error("Error name:", err.name);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      console.error("Full error object:", JSON.stringify(err, null, 2));
    });
} else {
  console.error("Cannot connect to MongoDB: MONGODB_URI is not defined");
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/food-listings", foodListingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
