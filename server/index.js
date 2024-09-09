const port = process.env.PORT || 4000;
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Ensure environment variables are loaded
const connectDB = require("./config/dbConfig");
const app = express();

app.use(express.json());
app.use(cors());

// Database Connection
connectDB(); 

// Import Routes
const adminRoutes = require("./routes/adminRoutes");
const clientRoutes = require("./routes/clientRoutes");

// Use Routes
app.use("/", adminRoutes); // Admin routes
app.use("/", clientRoutes); // Client routes

app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on Port " + port);
  } else {
    console.log("Error: " + error);
  }
});
