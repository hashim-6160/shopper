const jwt = require("jsonwebtoken");
require("dotenv").config(); 

const fetchUser = (req, res, next) => {
  const token = req.header("auth-token");

  if (!token) {
    return res.status(401).json({ error: "Authentication required: no token provided" });
  }

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = data.user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired: please log in again" });
    }
    res.status(401).json({ error: "Invalid token: authentication failed" });
  }
};

module.exports = fetchUser;
