const express = require("express");

const userController = require("../controllers/userController");
const { protect } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();

// Public routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Private routes
router.get("/profile", protect, userController.getUserProfile);
router.put("/profile", protect, upload.single("profilePicture"), userController.updateUserProfile);
router.put("/toggle-like-song/:id", protect, userController.toggleLikeSong);
router.put("/toggle-follow-artist/:id", protect, userController.toggleFollowArtist);

module.exports = router;
