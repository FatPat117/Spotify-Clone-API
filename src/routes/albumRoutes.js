const express = require("express");
const { protect, isAdmin } = require("../middlewares/auth");
const albumController = require("../controllers/albumController");
const upload = require("../middlewares/upload");

const router = express.Router();

// Public routes
router.get("/", albumController.getAlbums);
router.get("/:id", albumController.getAlbumById);

// Admin routes
router.post("/", protect, isAdmin, upload.single("coverImage"), albumController.createAlbum);
router.put("/:id", protect, isAdmin, upload.single("coverImage"), albumController.updateAlbum);
module.exports = router;
