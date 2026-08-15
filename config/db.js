const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");

async function initializeDatabase(db) {
  const requiredCollections = [
    "archives",
    "claims",
    "collecteds",
    "items",
    "users"
  ];

  try {
    // 1. Get existing collections
    const collections = await db.listCollections().toArray();
    const existingNames = collections.map((col) => col.name);

    // 2. Create only missing collections (non-destructive)
    for (const colName of requiredCollections) {
      if (!existingNames.includes(colName)) {
        await db.createCollection(colName);
        console.log(`[Database Init] Created collection: ${colName}`);
      } else {
        console.log(
          `[Database Init] Collection already exists: ${colName}`
        );
      }
    }

    // 3. Ensure required default admin and manager accounts
    const bcrypt = require("bcryptjs");

    const adminEmail =
      process.env.ADMIN_EMAIL || "admin@findmything.com";

    const adminPassword =
      process.env.ADMIN_PASSWORD || "adminpassword";

    const managerEmail =
      process.env.MANAGER_EMAIL || "manager@findmything.com";

    const managerPassword =
      process.env.MANAGER_PASSWORD || "managerpassword";

    // ---------- ADMIN ----------
    const adminExists = await db
      .collection("users")
      .findOne({ email: adminEmail });

    if (!adminExists) {
      const hashedAdminPassword = await bcrypt.hash(
        adminPassword,
        10
      );

      await db.collection("users").insertOne({
        name: "Default Admin",
        email: adminEmail,
        password: hashedAdminPassword,
        role: "admin",
        is_verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(
        `[Database Init] Seeded default admin account: ${adminEmail}`
      );
    } else if (
      adminExists.password &&
      !adminExists.password.startsWith("$2")
    ) {
      // Auto-hash existing plaintext admin password
      const hashed = await bcrypt.hash(
        adminExists.password,
        10
      );

      await db.collection("users").updateOne(
        { _id: adminExists._id },
        { $set: { password: hashed } }
      );

      console.log(
        "[Database Init] Upgraded admin password to bcrypt hash."
      );
    }

    // ---------- MANAGER ----------
    const managerExists = await db
      .collection("users")
      .findOne({ email: managerEmail });

    if (!managerExists) {
      const hashedManagerPassword = await bcrypt.hash(
        managerPassword,
        10
      );

      await db.collection("users").insertOne({
        name: "Default Manager",
        email: managerEmail,
        password: hashedManagerPassword,
        role: "manager",
        is_verified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(
        `[Database Init] Seeded default manager account: ${managerEmail}`
      );
    } else if (
      managerExists.password &&
      !managerExists.password.startsWith("$2")
    ) {
      // Auto-hash existing plaintext manager password
      const hashed = await bcrypt.hash(
        managerExists.password,
        10
      );

      await db.collection("users").updateOne(
        { _id: managerExists._id },
        { $set: { password: hashed } }
      );

      console.log(
        "[Database Init] Upgraded manager password to bcrypt hash."
      );
    }

    console.log(
      "[Database Init] Database structure verified and initialized successfully."
    );
  } catch (err) {
    console.error(
      "[Database Init] Error during database initialization:",
      err
    );

    throw err;
  }
}

// Connect to MongoDB
async function connectDB() {
  try {
    const uri =
      process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGO_URI is not configured");
    }

    await mongoose.connect(uri, {
      dbName: "findmything"
    });

    console.log(
      `MongoDB Connected: ${mongoose.connection.name}`
    );

    await initializeDatabase(mongoose.connection.db);

  } catch (err) {
    console.error("MongoDB Connection Error:", err);

    // Important for Vercel/serverless
    throw err;
  }
}

module.exports = connectDB;