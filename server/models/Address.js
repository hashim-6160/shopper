const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // Reference to the User model
    required: true
  },
  name: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  addressType: {
    type: String,
    enum: ['home', 'work'],
    required: true
  },
  landmark: {
    type: String,
    default: ''
  },
  mobile: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  alternate: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model("Address", addressSchema);
