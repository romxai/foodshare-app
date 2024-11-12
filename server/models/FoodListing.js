const mongoose = require("mongoose");

const foodListingSchema = new mongoose.Schema(
  {
    foodType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    quantityUnit: {
      type: String,
      enum: ["Kg", "g", "L", "ml"],
      required: true,
    },
    servings: {
      type: Number,
      required: true,
    },
    expiration: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const FoodListing = mongoose.model("FoodListing", foodListingSchema);

module.exports = FoodListing;
