const path = require('path');
const User = require('../models/User');

// Serves current user session details
async function getCurrentUser(req, res) {
  try {
    if (!req.session || !req.session.userId) {
      return res.json({});
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.json({});
    }

    res.json({
      name: user.name,
      role: user.role
    });
  } catch (err) {
    console.error("Get Current User Error:", err);
    res.json({});
  }
}

// Serves main index page
function serveIndex(req, res) {
  res.sendFile(path.join(__dirname, "../views/user/index.html"));
}

// Serves authentication pages
function serveLogin(req, res) {
  res.sendFile(path.join(__dirname, "../views/auth/login.html"));
}

function serveRegister(req, res) {
  res.sendFile(path.join(__dirname, "../views/auth/register.html"));
}

function serveLoginOtp(req, res) {
  res.sendFile(path.join(__dirname, "../views/auth/login-otp.html"));
}

function serveReset(req, res) {
  res.sendFile(path.join(__dirname, "../views/auth/reset.html"));
}

// Serves user-facing lost and found catalog pages
function serveMyItems(req, res) {
  res.sendFile(path.join(__dirname, "../views/user/my-items.html"));
}

function serveReportLost(req, res) {
  res.sendFile(path.join(__dirname, "../views/user/report-lost.html"));
}

function serveReportFound(req, res) {
  res.sendFile(path.join(__dirname, "../views/user/report-found.html"));
}

function serveCollected(req, res) {
  res.sendFile(path.join(__dirname, "../views/user/collected.html"));
}

function serveItems(req, res) {
  res.sendFile(path.join(__dirname, "../views/user/items.html"));
}

// Serves administrative panels
function serveAdmin(req, res) {
  res.sendFile(path.join(__dirname, "../views/admin/admin.html"));
}

function serveAnalytics(req, res) {
  res.sendFile(path.join(__dirname, "../views/admin/analytics.html"));
}

function serveManager(req, res) {
  res.sendFile(path.join(__dirname, "../views/admin/manager.html"));
}

module.exports = {
  getCurrentUser,
  serveIndex,
  serveLogin,
  serveRegister,
  serveLoginOtp,
  serveReset,
  serveMyItems,
  serveReportLost,
  serveReportFound,
  serveCollected,
  serveItems,
  serveAdmin,
  serveAnalytics,
  serveManager
};
