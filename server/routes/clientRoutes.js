const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Users = require("../models/Users");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config(); // Load environment variables
const fetchUser = require("../middleware/fetchUser");
const bcrypt = require("bcryptjs");

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
  for (let i = 0; i < 200; i++) {
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
  const token = jwt.sign(data, process.env.JWT_SECRET); // Use secret from .env
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
  }else if (user.isAdmin == true) {
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
  const token = jwt.sign(data, process.env.JWT_SECRET); // Use secret from .env
  res.json({ success: true, token });
});
// Get available products (user view)
router.get("/availableproducts", async (req, res) => {
  try {
    const availableProducts = await Product.find({ available: true }); // Fetch only available products
    res.json(availableProducts);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// New collections
router.get("/newcollections", async (req, res) => {
  try {
    const products = await Product.find({ available: true });
    const newCollections = products.slice(-8); // Get the latest 8 products
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
    }); // Use the correct case for "Women"
    const popularInWomen = products.slice(0, 4); // Get the first 4 products
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
    // Find the current product by its ID
    const currentProduct = await Product.findOne({
      id: productId,
      available: true,
    });

    if (!currentProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Fetch related products based on the same category or brand, and exclude the current product
    const relatedProducts = await Product.find({
      targetGroup: currentProduct.targetGroup, // Use category or other criteria for related products
      available: true,
      id: { $ne: currentProduct.id }, // Exclude the current product
    }).limit(4); // Get up to 4 related products

    console.log("Related Products Fetched: ", relatedProducts);

    res.json(relatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add to cart
router.post("/addtocart", fetchUser, async (req, res) => {
  try {
    const userData = await Users.findOne({ _id: req.user.id });

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update cart with the new item
    if (!userData.cartData[req.body.itemId]) {
      userData.cartData[req.body.itemId] = 0; // Initialize cart item if not present
    }
    userData.cartData[req.body.itemId] += 1;

    await userData.save(); // Save updated cartData
    res.json({ message: "Added to Cart", cart: userData.cartData });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Server error while adding to cart" });
  }
});

// Remove from cart
router.post("/removefromcart", fetchUser, async (req, res) => {
  try {
    const userData = await Users.findOne({ _id: req.user.id });

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure the item exists in the cart
    if (
      userData.cartData[req.body.itemId] &&
      userData.cartData[req.body.itemId] > 0
    ) {
      userData.cartData[req.body.itemId] -= 1;

      if (userData.cartData[req.body.itemId] === 0) {
        delete userData.cartData[req.body.itemId]; // Optional: remove item from cart when quantity is 0
      }

      await userData.save(); // Save updated cartData
      res.json({ message: "Removed from Cart", cart: userData.cartData });
    } else {
      res
        .status(400)
        .json({ message: "Item not found in cart or invalid quantity" });
    }
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ error: "Server error while removing from cart" });
  }
});

// Get cart data
router.post("/getcart", fetchUser, async (req, res) => {
  try {
    const userData = await Users.findOne({ _id: req.user.id });

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(userData.cartData); // Send cart data to client
  } catch (error) {
    console.error("Error fetching cart data:", error);
    res.status(500).json({ error: "Server error while fetching cart data" });
  }
});

module.exports = router;
