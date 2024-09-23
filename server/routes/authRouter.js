
const Users = require('../models/Users');
const express = require("express");
const { oauth2client } = require('../utils/googleConfig');
const axios = require('axios');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Function to generate and send JWT token
const generateToken = (res, user) => {
  const token = jwt.sign(
    { _id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_TIMEOUT || '1h' } // Default to 1 hour if not set
  );

  // Set the token as a cookie (or return in response, depending on your needs)
  res.cookie('token', token, {
    httpOnly: true, // Secure, only accessible via HTTP
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  return token;
};

router.get('/google', async (req, res) => {
  console.log("Google OAuth process started...");
  try {
    const { code } = req.query;

    // Get OAuth tokens with the authorization code
    const googleRes = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleRes.tokens);

    // Fetch user info using the access token
    const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);
    console.log(userRes.data);

    const { email, name } = userRes.data;

    // Find or create the user in the database
    let user = await Users.findOne({ email });
    if (!user) {
      // Create new user if not found
      user = await Users.create({
        email,
        name
      });
    }

    // Generate token and set it in the response
    generateToken(res, { _id: user._id, name: user.name, email: user.email });

    res.status(200).json({ message: 'Google OAuth successful', user: { _id: user._id, name: user.name, email: user.email } });
    console.log("success");
    
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.status(500).json({ message: 'OAuth error', error });
  }
});

module.exports = router;

