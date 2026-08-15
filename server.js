const express = require("express");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

// Load Environment Variables
dotenv.config();

const connectDB = require("./config/db");
const { runStartupMigration, getCurrentCycle } = require("./utils/helper");
const Item = require("./models/Item");
const Collected = require("./models/Collected");

// Import Route Handlers
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/findmything";
const isProduction = process.env.NODE_ENV === "production";

// Enable trust proxy for cloud environments behind load balancers/reverse proxies
app.set("trust proxy", 1);

// Security Headers Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled to allow external CDNs and inline scripts used in views
  crossOriginEmbedderPolicy: false
}));

// Basic Express Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Persistent Session Middleware with MongoDB Store
app.use(session({
  secret: process.env.SESSION_SECRET || "findmything_session_secret_default_key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoUri,
    collectionName: "sessions",
    ttl: 7 * 24 * 60 * 60 // 7 days
  }),
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// Static Files Serving
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Register Route Middlewares
app.use(authRoutes);
app.use(itemRoutes);
app.use(adminRoutes);
app.use(userRoutes); // Fallback router serving index and static pages

// Global Error Handler Middleware
app.use(errorHandler);

// Connect to MongoDB Database and start server
connectDB().then(() => {
  // Run migration backfill for existing DB items
  setTimeout(runStartupMigration, 1000);

  // Start the Express server
  app.listen(PORT, () => {
    console.log(`Server running in ${isProduction ? "production" : "development"} mode on port ${PORT}`);
  });
});

/* ================= AUTO DELETE OLD COLLECTED (30 days limit) ================= */
setInterval(async () => {
  try {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);

    await Collected.deleteMany({
      collectedAt: { $lt: date }
    });
  } catch (err) {
    console.error("Auto delete collected interval error:", err.message);
  }
}, 86400000);

/* ================= AUTO CYCLE RESET ================= */
let lastCycle = getCurrentCycle();

setInterval(async () => {
  try {
    const currentCycle = getCurrentCycle();

    if (currentCycle !== lastCycle) {
      console.log("🔄 Cycle Changed → Resetting Data");

      await Item.deleteMany({ cycle: lastCycle });
      await Collected.deleteMany({ cycle: lastCycle });

      lastCycle = currentCycle;
    }
  } catch (err) {
    console.error("Auto cycle reset interval error:", err.message);
  }
}, 86400000);

// Server start is deferred to connectDB promise resolution
