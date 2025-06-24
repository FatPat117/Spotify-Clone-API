const express = require("express");

const userController = require("../controllers/userController");
const protect = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Private routes
router.get("/profile", protect, userController.getUserProfile);
router.put("/profile", protect, userController.updateUserProfile);

module.exports = router;
