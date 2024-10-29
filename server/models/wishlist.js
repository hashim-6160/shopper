const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WishlistSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      size: { type: String },
    },
  ],
});

module.exports = mongoose.model("Wishlist", WishlistSchema);
