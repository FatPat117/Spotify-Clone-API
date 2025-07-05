const express = require("express");
const { protect, isAdmin } = require("../middlewares/auth");
const playlistController = require("../controllers/playlistController");
const upload = require("../middlewares/upload");

const router = express.Router();

// Public routes
router.get("/", playlistController.getPlaylists);
router.get("/:id", playlistController.getPlaylistById);
router.get("/user/me", protect, playlistController.getUserPlaylists);

// Admin routes
router.post("/", protect, isAdmin, upload.single("coverImage"), playlistController.createPlaylist);
router.put("/:id", protect, isAdmin, upload.single("coverImage"), playlistController.updatePlaylist);
module.exports = router;
