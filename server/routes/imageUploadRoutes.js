const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

router.use("/images", express.static("upload/images"));

router.post("/upload", upload.array("productImages",5), (req, res) => {
  const imageUrls = req.files.map((file) => `http://localhost:4000/images/${file.filename}`);
  res.json({
    success: 1,
    images: imageUrls,
  });
});

module.exports = router;
