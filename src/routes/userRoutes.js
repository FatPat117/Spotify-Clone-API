const express = require("express");

const userController = require("../controllers/userController");
const protect = require("../middlewares/auth");

const router = express.Router();

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/profile", protect, userController.getUserProfile);
module.exports = router;
