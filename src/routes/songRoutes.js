const express = require("express");
const upload = require("../middlewares/upload");
const songController = require("../controllers/songController");
const { protect, isAdmin } = require("../middlewares/auth");

const router = express.Router();

// Config multer for  multiple file upload
const songUpload = upload.fields([
        { name: "audio", maxCount: 1 },
        { name: "cover", maxCount: 1 },
]);

// Public routes
router.get("/", songController.getSongs);

// Admin routes
router.post("/", protect, isAdmin, songUpload, songController.createSong);

module.exports = router;
