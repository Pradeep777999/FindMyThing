const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const { sendEmail } = require("../utils/helper");

// ======================================================
// Helper: Save session reliably on Vercel
// ======================================================
function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// ======================================================
// Generate OTP
// ======================================================
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000);
}

// ======================================================
// Hash OTP
// ======================================================
function hashOtp(otp) {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");
}

// ======================================================
// REGISTER
// ======================================================
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const exist = await User.findOne({ email });

    if (exist) {
      return res.send("Email already exists");
    }

    const user = new User({
      name,
      email,
      password,
      role: "user",
      is_verified: false
    });

    await user.save();

    // Generate OTP
    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    // Store OTP in MongoDB-backed session
    req.session.registrationOtp = {
      email,
      otp: hashedOtp,
      type: "register",
      expires: Date.now() + 5 * 60 * 1000,
      attempts: 0
    };

    await saveSession(req);

    // Send OTP
    await sendEmail(
      email,
      "Registration Verification - FindMyThing",
      `
      <h2>Welcome to FindMyThing</h2>

      <p>
        Thank you for registering.
        Please verify your email using the OTP below:
      </p>

      <h1 style="letter-spacing: 2px; color: #1a2744;">
        ${otp}
      </h1>

      <p>Valid for 5 minutes.</p>
      `
    );

    // Redirect to OTP page
    return res.redirect(
      `/login-otp.html?email=${encodeURIComponent(email)}`
    );

  } catch (err) {
    console.error("Register Error:", err);
    return res.status(500).send("Register failed");
  }
}

// ======================================================
// LOGIN
// ======================================================
async function login(req, res) {
  try {
    const { email, password, role } = req.body;

    const isJson =
      req.xhr ||
      (req.headers["accept"] &&
        req.headers["accept"].includes("application/json")) ||
      (req.headers["content-type"] &&
        req.headers["content-type"].includes("application/json"));

    const user = await User.findOne({ email });

    if (!user) {
      const errMsg = "Invalid email or password. Please try again.";

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

    // Auto-upgrade old plaintext password
    if (
      user.password &&
      !user.password.startsWith("$2a$") &&
      !user.password.startsWith("$2b$") &&
      !user.password.startsWith("$2y$")
    ) {
      user.password = password;
      await user.save();
    }

    if (user.role !== role) {
      const errMsg = "Invalid credentials";

      if (isJson) {
        return res.status(401).json({ error: errMsg });
      }

      return res.status(401).send(errMsg);
    }

    const sendRedirect = (url) => {
      if (isJson) {
        return res.json({
          success: true,
          redirect: url
        });
      }

      return res.redirect(url);
    };

    // ==================================================
    // ADMIN / MANAGER - NO OTP
    // ==================================================
    if (role === "admin" || role === "manager") {

      req.session.userId = user._id;
      req.session.role = user.role;

      await saveSession(req);

      if (role === "admin") {
        return sendRedirect("/admin.html");
      }

      return sendRedirect("/manager.html");
    }

    // ==================================================
    // UNVERIFIED USER
    // ==================================================
    if (user.is_verified === false) {

      let otpData = req.session.registrationOtp;

      // Generate OTP if missing or expired
      if (
        !otpData ||
        otpData.email !== email ||
        otpData.expires < Date.now()
      ) {

        const otp = generateOtp();
        const hashedOtp = hashOtp(otp);

        req.session.registrationOtp = {
          email,
          otp: hashedOtp,
          type: "register",
          expires: Date.now() + 5 * 60 * 1000,
          attempts: 0
        };

        await saveSession(req);

        await sendEmail(
          email,
          "Registration Verification - FindMyThing",
          `
          <h2>Email Verification</h2>

          <p>Your verification code is:</p>

          <h1 style="letter-spacing: 2px; color: #1a2744;">
            ${otp}
          </h1>

          <p>Valid for 5 minutes.</p>
          `
        );
      }

      return sendRedirect(
        `/login-otp.html?email=${encodeURIComponent(email)}&error=unverified`
      );
    }

    // ==================================================
    // VERIFIED USER
    // ==================================================

    req.session.userId = user._id;
    req.session.role = user.role;

    await saveSession(req);

    if (role === "admin") {
      return sendRedirect("/admin.html");
    }

    if (role === "manager") {
      return sendRedirect("/manager.html");
    }

    return sendRedirect("/");
  }

  catch (err) {
    console.error("Login Error:", err);

    const errMsg = "Login failed";

    if (
      req.headers["content-type"] === "application/json" ||
      req.xhr
    ) {
      return res.status(500).json({
        error: errMsg
      });
    }

    return res.status(500).send(errMsg);
  }
}

// ======================================================
// LOGOUT
// ======================================================
function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
}

// ======================================================
// SEND OTP
// ======================================================
async function sendOtp(req, res) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.send("Email not registered");
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);

    // ==================================================
    // REGISTRATION VERIFICATION
    // ==================================================
    if (user.is_verified === false) {

      req.session.registrationOtp = {
        email,
        otp: hashedOtp,
        type: "register",
        expires: Date.now() + 5 * 60 * 1000,
        attempts: 0
      };

      await saveSession(req);

      await sendEmail(
        email,
        "Registration Verification - FindMyThing",
        `
        <h2>Email Verification</h2>

        <p>Your verification code is:</p>

        <h1 style="letter-spacing: 2px; color: #1a2744;">
          ${otp}
        </h1>

        <p>Valid for 5 minutes.</p>
        `
      );

      return res.send(
        "OTP sent successfully. Please check your inbox."
      );
    }

    // ==================================================
    // PASSWORD RESET
    // ==================================================

    req.session.resetOtp = {
      email,
      otp: hashedOtp,
      type: "reset",
      expires: Date.now() + 5 * 60 * 1000,
      attempts: 0
    };

    await saveSession(req);

    await sendEmail(
      email,
      "OTP Reset",
      `<h1>${otp}</h1><p>Valid for 5 minutes.</p>`
    );

    return res.send("OTP sent");

  } catch (err) {
    console.error("Send OTP Error:", err);
    return res.status(500).send("Failed to send OTP");
  }
}

// ======================================================
// VERIFY LOGIN OTP
// Registration verification
// ======================================================
async function verifyLoginOtp(req, res) {
  try {
    const { email, otp } = req.body;

    const data = req.session.registrationOtp;

    // IMPORTANT
    if (
      !data ||
      data.type !== "register" ||
      data.email !== email
    ) {
      return res.send("OTP not requested for registration");
    }

    if (data.expires < Date.now()) {
      delete req.session.registrationOtp;
      await saveSession(req);

      return res.send("OTP expired");
    }

    if (data.attempts >= 5) {
      return res.send(
        "Maximum OTP verification attempts exceeded"
      );
    }

    data.attempts++;

    const hashedInput = hashOtp(otp);

    if (data.otp !== hashedInput) {
      await saveSession(req);
      return res.send("Invalid OTP");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.send("User not found");
    }

    // Verify user
    user.is_verified = true;

    await user.save();

    // Remove OTP
    delete req.session.registrationOtp;

    await saveSession(req);

    return res.redirect("/login.html?registered=success");

  } catch (err) {
    console.error("Verify Login OTP Error:", err);
    return res.status(500).send("Failed to verify OTP");
  }
}

// ======================================================
// VERIFY RESET OTP
// ======================================================
async function verifyOtp(req, res) {
  try {

    const { email, otp } = req.body;

    const data = req.session.resetOtp;

    if (
      !data ||
      data.type !== "reset" ||
      data.email !== email
    ) {
      return res.send("OTP not requested");
    }

    if (data.expires < Date.now()) {
      delete req.session.resetOtp;
      await saveSession(req);

      return res.send("OTP expired");
    }

    const hashedInput = hashOtp(otp);

    if (data.otp !== hashedInput) {
      return res.send("Invalid OTP");
    }

    return res.send("OTP verified");

  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).send("Failed to verify OTP");
  }
}

// ======================================================
// RESET PASSWORD
// ======================================================
async function resetPassword(req, res) {
  try {

    const {
      email,
      password,
      confirmPassword
    } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).send(
        "Password must be at least 6 characters long"
      );
    }

    if (password !== confirmPassword) {
      return res.status(400).send(
        "Passwords do not match"
      );
    }

    const otpData = req.session.resetOtp;

    if (
      !otpData ||
      otpData.email !== email ||
      otpData.type !== "reset"
    ) {
      return res.status(400).send(
        "Please verify OTP first"
      );
    }

    if (otpData.expires < Date.now()) {
      delete req.session.resetOtp;
      await saveSession(req);

      return res.status(400).send(
        "OTP expired"
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    await User.updateOne(
      { email },
      {
        $set: {
          password: hashedPassword
        }
      }
    );

    delete req.session.resetOtp;

    await saveSession(req);

    return res.send(
      "Password reset successful"
    );

  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).send(
      "Failed to reset password"
    );
  }
}

// ======================================================
// EXPORT
// ======================================================
module.exports = {
  register,
  login,
  logout,
  sendOtp,
  verifyLoginOtp,
  verifyOtp,
  resetPassword
};