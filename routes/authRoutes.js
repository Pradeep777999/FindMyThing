const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');

// Rate limiter for general auth endpoints (prevent brute-force logins)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40, // Limit each IP to 40 login/register requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many attempts from this IP. Please try again after 15 minutes."
});

// Stricter rate limiter for OTP requests and verifications (prevent SMS/Email flooding)
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 OTP requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many OTP requests from this IP. Please try again after 15 minutes."
});

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.get("/logout", authController.logout);
router.post("/send-otp", otpLimiter, authController.sendOtp);
router.post("/verify-login-otp", otpLimiter, authController.verifyLoginOtp);
router.post("/verify-otp", otpLimiter, authController.verifyOtp);
router.post("/reset-password", authLimiter, authController.resetPassword);

module.exports = router;
