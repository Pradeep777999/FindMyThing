// Middlewares for HTML views (Redirects to /login.html)
function requireLoginView(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect("/login.html");
  }
  next();
}

function requireManagerView(req, res, next) {
  if (!req.session || (req.session.role !== "manager" && req.session.role !== "admin")) {
    return res.redirect("/login.html");
  }
  next();
}

function requireAdminView(req, res, next) {
  if (!req.session || req.session.role !== "admin") {
    return res.redirect("/login.html");
  }
  next();
}

// Middlewares for API endpoints (Sends text/JSON responses)
function requireManagerApi(req, res, next) {
  if (!req.session || (req.session.role !== "manager" && req.session.role !== "admin")) {
    return res.send("Manager/Admin only");
  }
  next();
}

function requireAdminApi(req, res, next) {
  if (!req.session || req.session.role !== "admin") {
    return res.send("Admin only");
  }
  next();
}

function requireManagerOrAdminApi(req, res, next) {
  if (!req.session || (req.session.role !== "manager" && req.session.role !== "admin")) {
    return res.status(403).json({ success: false, message: "Unauthorized: Access denied." });
  }
  next();
}

module.exports = {
  requireLoginView,
  requireManagerView,
  requireAdminView,
  requireManagerApi,
  requireAdminApi,
  requireManagerOrAdminApi
};
