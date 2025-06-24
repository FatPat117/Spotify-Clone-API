const express = require("express");
const artistController = require("../controllers/artistController");
const upload = require("../middlewares/upload");
const protect = require("../middlewares/auth");

const router = express.Router();

// Public routes

// Admin routes
router.post("/", protect, upload.single("image"), artistController.createArtist);

module.exports = router;
