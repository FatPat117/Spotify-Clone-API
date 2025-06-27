const express = require("express");
const artistController = require("../controllers/artistController");
const upload = require("../middlewares/upload");
const { protect, isAdmin } = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.get("/top", artistController.getTopArtists);
router.get("/", artistController.getArtists);
router.get("/:id/top-songs", artistController.getArtistTopSongs);
router.get("/:id", artistController.getArtistById);

// Admin routes
router.post("/", protect, isAdmin, upload.single("image"), artistController.createArtist);
router.delete("/:id", protect, isAdmin, artistController.deleteArtist);
router.put("/:id", protect, isAdmin, upload.single("image"), artistController.updateArtist);

module.exports = router;
