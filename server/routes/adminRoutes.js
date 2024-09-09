const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Users = require("../models/Users");
const upload = require("../config/imageUploadConfig");

// Admin Login Route
router.post("/loggin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Users.findOne({ email, isAdmin: true });
    console.log(user);
    
    if (!user) {
      return res.status(400).json({ success: false, error: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Image Uploads
router.use("/images", express.static("upload/images"));

router.post("/upload", upload.array("productImages", 5), (req, res) => {
  const imageUrls = req.files.map(
    (file) => `http://localhost:4000/images/${file.filename}`
  );
  res.json({
    success: 1,
    images: imageUrls,
  });
});

// add product
router.post("/addproduct", async (req, res) => {
  try {
    const { category, name, description, images, new_price, old_price, brand, stock, targetGroup } = req.body;

    // Validate and format category
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    // Generating new product ID
    const products = await Product.find({});
    const id = products.length > 0 ? products.slice(-1)[0].id + 1 : 1;

    // Create new product
    const product = new Product({
      id,
      name,
      description,
      images,
      new_price,
      old_price,
      category,
      brand,
      stock,
      targetGroup,
    });

    await product.save();
    res.status(200).json({ success: true, message: "Product successfully added" });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, message: "Failed to add product" });
  }
});

// Get all products
router.get("/allproducts", async (req, res) => {
    try {
      const products = await Product.find({}); 
      console.log("All Products Fetched");
      console.log(products);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

// Remove a product
router.post("/removeproduct", async (req, res) => {
  try {
    const result = await Product.findOneAndUpdate(
      { id: req.body.id },
      { available: false }
    );
    if (result) {
      console.log("Product Removed");
      res.json({ success: true });
    } else {
      console.log("Product not found");
      res.status(404).json({ success: false, message: "Product not found" });
    }
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// Relist a product
router.post("/relistproduct", async (req, res) => {
  try {
    const result = await Product.findOneAndUpdate(
      { id: req.body.id },
      { available: true }
    );
    if (result) {
      console.log("Product relisted");
      res.json({ success: true });
    } else {
      console.log("Product not found");
      res.status(404).json({ success: false, message: "Product not found" });
    }
  } catch (error) {
    console.error("Error relisting product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Route to update a product
router.post("/updateproduct", async (req, res) => {
  const { id, name, description, old_price, new_price, stock, brand, targetGroup } = req.body;

  try {
    const product = await Product.findOneAndUpdate(
      { id },
      { name, description, old_price, new_price, stock, brand, targetGroup },
      { new: true } // This option returns the updated product
    );

    if (product) {
      console.log("Product updated successfully:", product);
      res.status(200).json({ success: true, message: "Product updated successfully", product });
    } else {
      res.status(404).json({ success: false, message: "Product not found" });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all users list
router.get("/listusers", async (req, res) => {
  try {
    const users = await Users.find({ isAdmin: false });
    console.log("All Users are Fetched");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ message: "Server error" });
  }
});

// Block user
router.post("/blockuser", async (req, res) => {
  try {
    const { id } = req.body;
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    user.isBlocked = true;
    await user.save();
    res.status(200).send({ message: "User blocked successfully", user });
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).send({ message: "Server error" });
  }
});

// Unblock user
router.post("/unblockuser", async (req, res) => {
  try {
    const { id } = req.body;
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    user.isBlocked = false;
    await user.save();
    res.status(200).send({ message: "User unblocked successfully", user });
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).send({ message: "Server error" });
  }
});
  
// Route to add a category
router.post("/addcategory", async (req, res) => {
  const { name, description } = req.body;
  try {
    const newCategory = new Category({ name, description });
    await newCategory.save();
    console.log(newCategory);

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Route to get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
    console.log(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Route to update a category
router.put("/updatecategory/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true } // Return the updated document
    );

    if (updatedCategory) {
      res.json({ success: true, category: updatedCategory });
    } else {
      res.status(404).json({ success: false, message: "Category not found" });
    }
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// Route to toggle category active status
router.put("/togglecategory/:id", async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body; // Pass the new isActive status

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { isActive },
      { new: true } // Return the updated document
    );

    if (updatedCategory) {
      res.json({ success: true, category: updatedCategory });
    } else {
      res.status(404).json({ success: false, message: "Category not found" });
    }
  } catch (error) {
    console.error("Error updating category status:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
