const mongoose = require("mongoose");

// Product Schema
const productSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String, 
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category", 
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  stock: {
    type: Map, // Map to store stock for each size
    of: Number,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  targetGroup: {
    type: String,
    required: true,
    enum: ["Men", "Women", "Kids"],
  },
  size:{
    type: [String],
    enum: ["S", "M", "L", "XL", "XXL"],
    required: true, 
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
