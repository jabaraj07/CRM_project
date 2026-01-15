const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
    register,
    login,
    getMe,
    initialSetup
} = require("../controllers/authController");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/setup", initialSetup); // One-time initial admin setup

// Protected routes
router.get("/me", protect, getMe);

module.exports = router;
