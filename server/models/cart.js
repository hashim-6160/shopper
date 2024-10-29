const mongoose = require("mongoose");


const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, default: 1 },
      size:{type:String},
    },
  ],
  totalPrice: { type: Number, required: true, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
});


const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;