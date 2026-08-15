const User = require('../models/User');
const { sendEmail } = require('../utils/helper');
const { otpStore } = require('../utils/constants');

// Register POST
async function register(req, res) {
  try {
    const exist = await User.findOne({ email: req.body.email });
    if (exist) {
      return res.send("Email already exists");
    }

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: "user",
      is_verified: false
    });

    await user.save();

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const crypto = require('crypto');
    const hashedOtp = crypto.createHash('sha256').update(String(otp)).digest('hex');

    otpStore[req.body.email] = {
      otp: hashedOtp,
      rawOtp: otp,
      type: "register",
      expires: Date.now() + 5 * 60 * 1000,
      attempts: 0
    };

    // Send OTP to user's college email
    await sendEmail(
      req.body.email,
      "Registration Verification - FindMyThing",
      `
      <h2>Welcome to FindMyThing</h2>
      <p>Thank you for registering. Please verify your email using the following OTP code:</p>
      <h1 style="letter-spacing: 2px; color: #1a2744;">${otp}</h1>
      <p>Valid for 5 minutes.</p>
      `
    );

    // Redirect to OTP verification page
    res.redirect(`/login-otp.html?email=${req.body.email}`);
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).send("Register failed");
  }
}

// Login POST
async function login(req, res) {
  try {
    const { email, password, role } = req.body;
    
    // Check if request expects JSON response
    const isJson = req.xhr || 
                   (req.headers['accept'] && req.headers['accept'].includes('application/json')) ||
                   (req.headers['content-type'] && req.headers['content-type'].includes('application/json'));

    const user = await User.findOne({ email });

    if (!user) {
      const isPasswordInvalid = !password || password.length < 6;
      const errMsg = isPasswordInvalid 
        ? "Invalid email or password. Please try again."
        : "Please enter a valid email address.";
      
      if (isJson) {
        return res.status(401).json({ error: errMsg });
      }
      return res.status(401).send(errMsg);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const errMsg = "Incorrect password. Please try again.";
      if (isJson) {
        return res.status(401).json({ error: errMsg });
      }
      return res.status(401).send(errMsg);
    }

    // Auto-upgrade legacy plaintext passwords to bcrypt hash
    if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$') && !user.password.startsWith('$2y$')) {
      user.password = password; // Will be hashed by pre-save hook
      await user.save();
    }

    if (user.role !== role) {
      const errMsg = "Invalid credentials";
      if (isJson) {
        return res.status(401).json({ error: errMsg });
      }
      return res.status(401).send(errMsg);
    }

    // Helper to send either JSON or standard redirect
    const sendRedirect = (url) => {
      if (isJson) {
        return res.json({ success: true, redirect: url });
      }
      return res.redirect(url);
    };

    // Predefined Admin and Manager Accounts bypass OTP
    if (role === "admin" || role === "manager") {
      req.session.userId = user._id;
      req.session.role = user.role;
      if (role === "admin") {
        return sendRedirect("/admin.html");
      } else {
        return sendRedirect("/manager.html");
      }
    }

    // Check verification status
    if (user.is_verified === false) {
      // Generate/resend OTP if not present or expired
      let otpData = otpStore[email];
      if (!otpData || otpData.expires < Date.now()) {
        const otp = Math.floor(100000 + Math.random() * 900000);
        const crypto = require('crypto');
        const hashedOtp = crypto.createHash('sha256').update(String(otp)).digest('hex');
        otpStore[email] = {
          otp: hashedOtp,
          type: "register",
          expires: Date.now() + 5 * 60 * 1000,
          attempts: 0
        };
        await sendEmail(
          email,
          "Registration Verification - FindMyThing",
          `
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="letter-spacing: 2px; color: #1a2744;">${otp}</h1>
          <p>Valid for 5 minutes</p>
          `
        );
      }
      return sendRedirect(`/login-otp.html?email=${email}&error=unverified`);
    }

    req.session.userId = user._id;
    req.session.role = user.role;

    if (role === "admin") {
      return sendRedirect("/admin.html");
    } else if (role === "manager") {
      return sendRedirect("/manager.html");
    } else {
      return sendRedirect("/");
    }
  } catch (err) {
    console.error("Login Error:", err);
    const errMsg = "Login failed";
    if (req.headers['content-type'] === 'application/json' || req.xhr) {
      return res.status(500).json({ error: errMsg });
    }
    res.status(500).send(errMsg);
  }
}

// Logout GET
function logout(req, res) {
  req.session.destroy();
  res.redirect("/login.html");
}

// Send OTP POST (for password reset and resending registration verification)
async function sendOtp(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.send("Email not registered");
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const crypto = require('crypto');
    const hashedOtp = crypto.createHash('sha256').update(String(otp)).digest('hex');

    if (user.is_verified === false) {
      otpStore[email] = {
        otp: hashedOtp,
        rawOtp: otp,
        type: "register",
        expires: Date.now() + 5 * 60 * 1000,
        attempts: 0
      };

      await sendEmail(
        email,
        "Registration Verification - FindMyThing",
        `
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 2px; color: #1a2744;">${otp}</h1>
        <p>Valid for 5 minutes</p>
        `
      );
      res.send("OTP sent successfully. Please check your inbox.");
    } else {
      otpStore[email] = {
        otp: hashedOtp,
        rawOtp: otp,
        type: "reset",
        expires: Date.now() + 5 * 60 * 1000,
        attempts: 0
      };

      await sendEmail(email, "OTP Reset", `<h1>${otp}</h1>`);
      res.send("OTP sent");
    }
  } catch (err) {
    console.error("Send OTP Error:", err);
    res.status(500).send("Failed to send OTP");
  }
}

// Verify Login OTP POST (for registration verification)
async function verifyLoginOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const data = otpStore[email];

    if (!data || data.type !== "register") return res.send("OTP not requested for registration");
    if (data.expires < Date.now()) return res.send("OTP expired");
    
    if (data.attempts >= 5) {
      return res.send("Maximum OTP verification attempts exceeded");
    }
    data.attempts = (data.attempts || 0) + 1;

    const crypto = require('crypto');
    const hashedInput = crypto.createHash('sha256').update(String(otp)).digest('hex');
    if (data.otp !== hashedInput) return res.send("Invalid OTP");

    const user = await User.findOne({ email });
    if (!user) return res.send("User not found");

    user.is_verified = true;
    await user.save();

    delete otpStore[email];
    res.redirect("/login.html?registered=success");
  } catch (err) {
    console.error("Verify Login OTP Error:", err);
    res.status(500).send("Failed to verify OTP");
  }
}

// Verify OTP POST (for password reset validation)
function verifyOtp(req, res) {
  const { email, otp } = req.body;
  const data = otpStore[email];

  if (!data || data.type !== "reset") return res.send("OTP not requested");
  if (data.expires < Date.now()) return res.send("OTP expired");

  const crypto = require('crypto');
  const hashedInput = crypto.createHash('sha256').update(String(otp)).digest('hex');
  if (data.otp !== hashedInput) return res.send("Invalid OTP");

  res.send("OTP verified");
}

// Reset Password POST
async function resetPassword(req, res) {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).send("Password must be at least 6 characters long");
    }

    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match");
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.updateOne({ email }, { $set: { password: hashedPassword } });
    delete otpStore[email];

    res.send("Password reset successful");
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).send("Failed to reset password");
  }
}

module.exports = {
  register,
  login,
  logout,
  sendOtp,
  verifyLoginOtp,
  verifyOtp,
  resetPassword
};
