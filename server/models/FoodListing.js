const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  foodType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
    required: true
  },
  expiration: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const FoodListing = mongoose.model('FoodListing', foodListingSchema);

module.exports = FoodListing;