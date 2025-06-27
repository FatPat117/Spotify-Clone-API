const express = require("express");
const artistController = require("../controllers/artistController");
const upload = require("../middlewares/upload");
const { protect, isAdmin } = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.get("/", artistController.getArtists);
router.route("/:id")
        .get(artistController.getArtistById)
        .put(protect, isAdmin, upload.single("image"), artistController.updateArtist);

// Admin routes
router.post("/", protect, isAdmin, upload.single("image"), artistController.createArtist);

module.exports = router;
