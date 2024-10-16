const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Users = require("../models/Users");
const Order = require("../models/Order");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();
const fetchUser = require("../middleware/fetchUser");
const bcrypt = require("bcryptjs");
const Cart = require("../models/cart");
const Address = require("../models/Address");
const ObjectId = mongoose.Types.ObjectId;

// Signup Route
router.post("/signup", async (req, res) => {
  const { email, password, username, phone } = req.body;

  const check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res
      .status(400)
      .json({ success: false, error: "Existing user found" });
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = Date.now() + 3 * 60 * 1000;
  console.log(otp);

  const cart = {};
  for (let i = 0; i < 10; i++) {
    cart[i] = 0;
  }

  // Generate salt and hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new Users({
    name: username,
    email: email,
    password: hashedPassword,
    phone: phone,
    cartData: cart,
    otp: otp,
    otpExpiry: otpExpiry,
  });

  await user.save();

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res
        .status(500)
        .json({ success: false, error: "Failed to send OTP" });
    }
    res.json({ success: true, message: "OTP sent to your email" });
  });
});

// Resend OTP Route
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  const user = await Users.findOne({ email });

  if (!user) {
    return res.status(400).json({ success: false, error: "User not found" });
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = Date.now() + 3 * 60 * 1000;
  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code (Resend)",
    text: `Your new OTP code is ${otp}. It will expire in 3 minutes.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res
        .status(500)
        .json({ success: false, error: "Failed to resend OTP" });
    }
    res.json({ success: true, message: "New OTP sent to your email" });
  });
});

// Verify OTP Route
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const user = await Users.findOne({ email });

  if (!user) {
    return res.status(400).json({ success: false, error: "User not found" });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ success: false, error: "Invalid OTP" });
  }

  if (Date.now() > user.otpExpiry) {
    return res.status(400).json({ success: false, error: "OTP expired" });
  }

  user.otp = null;
  user.otpExpiry = null;
  await user.save();

  const data = { user: { id: user.id } };
  const token = jwt.sign(data, process.env.JWT_SECRET);
  res.json({ success: true, token });
});

// User Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await Users.findOne({ email });

  if (!user) {
    return res.status(400).json({ success: false, error: "Wrong Email Id" });
  } else if (user.isBlocked) {
    return res
      .status(400)
      .json({ success: false, error: "User is blocked by the Admin" });
  } else if (user.otp !== null) {
    return res
      .status(400)
      .json({ success: false, error: "Otp Verification Failed" });
  } else if (user.isAdmin == true) {
    return res
      .status(400)
      .json({ success: false, error: "Admin cannot Login" });
  }

  // Compare provided password with the stored hashed password
  const passCompare = await bcrypt.compare(password, user.password);
  if (!passCompare) {
    return res.status(400).json({ success: false, error: "Wrong Password" });
  }

  const data = { user: { id: user.id } };
  const token = jwt.sign(data, process.env.JWT_SECRET);
  res.json({ success: true, token });
});

// Get available products (user view)
router.get("/availableproducts", async (req, res) => {
  try {
    const availableProducts = await Product.find({ available: true });
    res.json(availableProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// New collections
router.get("/newcollections", async (req, res) => {
  try {
    const products = await Product.find({ available: true });
    const newCollections = products.slice(-8);
    console.log("New Collections Fetched");
    res.json(newCollections);
  } catch (error) {
    console.error("Error fetching new collections:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Popular in women category
router.get("/popularinwomen", async (req, res) => {
  try {
    const products = await Product.find({
      targetGroup: "Women",
      available: true,
    });
    const popularInWomen = products.slice(0, 4);
    console.log("Popular in Women Is Fetched");
    res.json(popularInWomen);
  } catch (error) {
    console.error("Error fetching popular products in women category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Related products
router.get("/relatedproducts/:productId", async (req, res) => {
  const { productId } = req.params;
  try {
    const currentProduct = await Product.findOne({
      id: productId,
      available: true,
    });

    if (!currentProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const relatedProducts = await Product.find({
      targetGroup: currentProduct.targetGroup,
      available: true,
      id: { $ne: currentProduct.id },
    }).limit(4);

    res.json(relatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add to cart
router.post("/addtocart", fetchUser, async (req, res) => {
  console.log("Request received to add to cart");
  try {
    const userId = req.user.id;
    const pId = req.body.itemId;

    // Find the cart for the user
    let cart = await Cart.findOne({ userId });
    const product = await Product.findById(pId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the product is in stock
    if (product.stock < 1) {
      return res.status(400).json({ message: "Product out of stock" });
    }

    // Create a new cart if it doesn't exist
    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    // Check for the existing product in the cart
    const existingProduct = cart.products.find(
      (p) => p.productId.toString() === pId.toString()
    );

    if (existingProduct) {
      // Restrict to a maximum of 5 units in the cart
      if (existingProduct.quantity >= 5) {
        return res
          .status(400)
          .json({ message: "You can only add up to 5 units of this product" });
      }

      // Check if there's enough stock for another increment
      if (product.stock < existingProduct.quantity + 1) {
        return res
          .status(400)
          .json({ message: "Not enough stock available for this product" });
      }

      // Increment the quantity if the product is already in the cart
      existingProduct.quantity += 1;
    } else {
      // Add new product to the cart with quantity = 1
      cart.products.push({
        productId: product._id,
        name: product.name,
        price: product.new_price,
        quantity: 1,
      });
    }

    // Decrease the product stock by 1
    product.stock -= 1;

    // Save the cart and update the product stock
    await cart.save();
    await product.save();

    res.json({ message: "Product added to cart successfully", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Increment quantity in cart
router.put("/increment/:productId", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product in the cart
    const productInCart = cart.products.find(
      (product) => product.productId.toString() === productId.toString()
    );

    if (!productInCart) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Fetch the actual product details to check stock availability
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Restrict the maximum quantity to 5
    if (productInCart.quantity >= 5) {
      return res.status(400).json({
        message:
          "You cannot have more than 5 units of this product in the cart",
      });
    }

    // Check if there is enough stock for another increment
    if (product.stock < productInCart.quantity + 1) {
      return res
        .status(400)
        .json({ message: "Not enough stock available for this product" });
    }

    // Increment the product quantity
    productInCart.quantity += 1;

    // Decrease the product stock by 1
    product.stock -= 1;

    // Save the updated cart and product stock
    await cart.save();
    await product.save();

    res.json({ message: "Product quantity incremented", cart });
  } catch (error) {
    console.error("Error incrementing product quantity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Decrement quantity in cart
router.put("/decrement/:productId", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product in the cart
    const productInCart = cart.products.find(
      (product) => product.productId.toString() === productId.toString()
    );

    if (!productInCart) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Fetch the actual product details to check stock
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Decrement the product quantity
    if (productInCart.quantity > 1) {
      productInCart.quantity -= 1;

      // Increase the product stock by 1 since the quantity is decremented
      product.stock += 1;

      await cart.save();
      await product.save();
      res.json({ message: "Product quantity decremented", cart });
    } else {
      // If the quantity is 1, remove the product from the cart
      cart.products = cart.products.filter(
        (product) => product.productId.toString() !== productId.toString()
      );

      // Increase the product stock by 1 since it is being removed
      product.stock += 1;

      await cart.save();
      await product.save();
      res.json({ message: "Product removed from cart", cart });
    }
  } catch (error) {
    console.error("Error decrementing product quantity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete product from cart
router.delete("/deletecart/:productId", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the product in the cart
    const productInCart = cart.products.find(
      (product) => product.productId.toString() === productId.toString()
    );

    if (!productInCart) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Fetch the actual product details to check stock
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Remove the product from the cart
    cart.products = cart.products.filter(
      (product) => product.productId.toString() !== productId.toString()
    );

    // Increase the product stock by the quantity in cart since it is being removed
    product.stock += productInCart.quantity;

    // Save the updated cart and product stock
    await cart.save();
    await product.save();

    res.json({ message: "Product removed from cart", cart });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get cart data
router.post("/getcart", fetchUser, async (req, res) => {
  try {
    const cartData = await Cart.findOne({ userId: req.user.id });

    await cartData.populate("products.productId");
    res.json(cartData);
  } catch (error) {
    console.error("Error fetching cart data:", error);
    res.status(500).json({ error: "Server error while fetching cart data" });
  }
});

// Add a new address
router.post("/addaddresses", fetchUser, async (req, res) => {
  try {
    const {
      name,
      city,
      state,
      address,
      pincode,
      addressType,
      landmark,
      mobile,
      email,
      alternate,
    } = req.body;
    const userId = req.user.id;

    const newAddress = new Address({
      userId,
      name,
      city,
      state,
      address,
      pincode,
      addressType,
      landmark,
      mobile,
      email,
      alternate,
    });

    await newAddress.save();
    res.json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all addresses for a user
router.get("/getaddresses", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.find({ userId });
    res.json({ success: true, addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add a new address
router.post("/addaddress", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      city,
      state,
      address,
      pincode,
      addressType,
      landmark,
      mobile,
      email,
      alternate,
    } = req.body;

    // Create a new address entry
    const newAddress = new Address({
      userId,
      name,
      city,
      state,
      address,
      pincode,
      addressType,
      landmark,
      mobile,
      email,
      alternate,
    });

    await newAddress.save();
    res.status(201).json({ success: true, newAddress });
  } catch (error) {
    console.error("Error adding address:", error);
    res.status(400).json({ success: false, message: "Failed to add address" });
  }
});

// Route to get a single address by ID
router.get("/getaddress/:id", fetchUser, async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address || address.userId.toString() !== req.user.id.toString()) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }
    res.json({ success: true, address });
  } catch (error) {
    console.error("Error fetching address:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update an address
router.put("/updateaddress/:id", fetchUser, async (req, res) => {
  try {
    const addressId = req.params.id;
    const {
      name,
      city,
      state,
      address,
      pincode,
      addressType,
      landmark,
      mobile,
      email,
      alternate,
    } = req.body;

    const addressToUpdate = await Address.findById(addressId);

    // Check if the address belongs to the logged-in user
    if (
      !addressToUpdate ||
      addressToUpdate.userId.toString() !== req.user.id.toString()
    ) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    // Update address details
    addressToUpdate.name = name;
    addressToUpdate.city = city;
    addressToUpdate.state = state;
    addressToUpdate.address = address;
    addressToUpdate.pincode = pincode;
    addressToUpdate.addressType = addressType;
    addressToUpdate.landmark = landmark;
    addressToUpdate.mobile = mobile;
    addressToUpdate.email = email;
    addressToUpdate.alternate = alternate;

    await addressToUpdate.save();
    res.json({
      success: true,
      message: "Address updated successfully",
      address: addressToUpdate,
    });
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete an address
router.delete("/deleteaddress/:id", fetchUser, async (req, res) => {
  try {
    const addressId = req.params.id;
    const addressToDelete = await Address.findById(addressId);

    // Check if the address belongs to the logged-in user
    if (
      !addressToDelete ||
      addressToDelete.userId.toString() !== req.user.id.toString()
    ) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    await Address.findByIdAndDelete(addressId);
    res.json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create an order
router.post("/createorder", fetchUser, async (req, res) => {
  const userId = req.user.id;
  const { orderData } = req.body;
  const address = orderData.address;

  try {
    const products = orderData.products;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "No products provided" });
    }

    const formattedProducts = products.map((product) => ({
      productId: new mongoose.Types.ObjectId(product.productId),
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      status: "Ordered",
    }));

    const newOrder = new Order({
      user: new mongoose.Types.ObjectId(userId),
      products: formattedProducts,
      totalPrice: orderData.totalPrice,
      shippingAddress: {
        street: address.street,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country,
      },
      paymentMethod: orderData.paymentMethod,
      paymentStatus: "Pending",
      orderStatus: "Processing",
    });

    const savedOrder = await newOrder.save();

    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.products = [];
      await cart.save();
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Get orders for a user with pagination
router.get("/getorder", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id;

    let { page = 1, limit = 3 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const startIndex = (page - 1) * limit;

    const totalOrders = await Order.countDocuments({
      user: new ObjectId(userId),
    });

    const orders = await Order.find({ user: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .exec();

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this user." });
    }

    res.status(200).json({
      orders,
      pagination: {
        totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        hasNextPage: page < Math.ceil(totalOrders / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Cancel a product in an order
router.post('/cancelOrder/:orderId/:productId', fetchUser, async (req, res) => {
  const { orderId, productId } = req.params;
  console.log("Cancel order route hit");

  try {
    // Find the order by ID and user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Find the product in the order
    const product = order.products.find(
      (p) => p.productId.toString() === productId
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found in order' });
    }

    // Update the product status to 'Cancelled' and set the cancellation reason
    if (product.status === 'Delivered') {
      return res
        .status(400)
        .json({ message: 'Delivered products cannot be cancelled' });
    }

    product.status = 'Cancelled';
    order.updatedAt = new Date();
    
    // Check if all products in the order are either cancelled or already processed
    const allCancelled = order.products.every(
      (p) => p.status === 'Cancelled' || p.status === 'Returned'
    );

    // If all products are cancelled or returned, update the order status to 'Cancelled'
    if (allCancelled) {
      order.orderStatus = 'Cancelled';
    }

    // Save the updated order
    await order.save();
    console.log(product.status);
    

    res.status(200).json({ message: 'Product cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error cancelling the product' });
  }
});

// Return a product in an order
router.post('/returnOrder/:orderId/:productId',fetchUser, async (req, res) => {
  const { orderId, productId } = req.params;

  try {
    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Find the product in the order
    const product = order.products.find(
      (p) => p.productId.toString() === productId
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found in order' });
    }

    // Ensure the product has been delivered before returning
    if (product.status !== 'Delivered') {
      return res
        .status(400)
        .json({ message: 'Only delivered products can be returned' });
    }

    // Update the product status to 'Cancelled' or 'Returned'
    product.status = 'Cancelled'; // or 'Returned'
    order.updatedAt = new Date();

    // Save the updated order
    await order.save();

    res.status(200).json({ message: 'Product returned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error returning the product' });
  }
});


// Get user profile
router.get("/profile", fetchUser, async (req, res) => {
  try {
    console.log("Fetching user profile...");

    const userData = await Users.findById(req.user.id); // Fetch user by ID

    if (!userData) {
      return res.status(400).json({ message: "No user found" });
    }

    res.status(200).json(userData); // Send user data if found
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Server error while fetching user profile" });
  }
});

// Update user profile
router.put("/updateprofile", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated user

    const { name, email, phoneNumber, password } = req.body; // Destructure the incoming data

    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Find the user and update
    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      { name, email, phone: phoneNumber, password:hashedPassword }, // Update the fields
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(400).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
});

module.exports = router;
