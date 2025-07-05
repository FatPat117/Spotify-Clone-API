const express = require("express");
const { protect, isAdmin } = require("../middlewares/auth");
const playlistController = require("../controllers/playlistController");
const upload = require("../middlewares/upload");

const router = express.Router();

// Public routes

// Admin routes
router.post("/", protect, isAdmin, upload.single("coverImage"), playlistController.createPlaylist);

module.exports = router;
