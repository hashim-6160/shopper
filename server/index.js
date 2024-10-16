const port = process.env.PORT || 4000;
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Ensure environment variables are loaded
const connectDB = require("./config/dbConfig");
const app = express();


app.use(express.json());

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173', // Allow your frontend origin
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], // Allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization', 'user-info'], // Include necessary headers
  credentials: true, // If you need to send cookies or authentication headers
}));
// Database Connection
connectDB(); 

// Import Routes
const adminRoutes = require("./routes/adminRoutes");
const clientRoutes = require("./routes/clientRoutes");
const authRouter =require('./routes/authRouter')

// Use Routes
app.use("/", adminRoutes); // Admin routes
app.use("/", clientRoutes); // Client routes
app.use('/auth',authRouter);

// Handle preflight requests
app.options('*', cors()); // Enable preflight response for all routes

app.listen(port, (error) => {
  if (!error) {
    console.log("Server Running on Port " + port);
  } else {
    console.log("Error: " + error);
  }
});
