const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function initializeDatabase(db) {
  const requiredCollections = [
    "archives",
    "claims",
    "collecteds",
    "items",
    "users"
  ];

  try {
    const collections = await db.listCollections().toArray();
    const existingNames = collections.map(col => col.name);

    for (const colName of requiredCollections) {
      if (!existingNames.includes(colName)) {
        await db.createCollection(colName);
        console.log(`[Database Init] Created collection: ${colName}`);
      } else {
        console.log(`[Database Init] Collection already exists: ${colName}`);
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const managerEmail = process.env.MANAGER_EMAIL;
    const managerPassword = process.env.MANAGER_PASSWORD;

    if (adminEmail && adminPassword) {
      const adminExists = await db
        .collection("users")
        .findOne({ email: adminEmail });

      if (!adminExists) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await db.collection("users").insertOne({
          name: "Admin",
          email: adminEmail,
          password: hashedPassword,
          role: "admin",
          is_verified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        console.log(`[Database Init] Admin created: ${adminEmail}`);
      }
    }

    if (managerEmail && managerPassword) {
      const managerExists = await db
        .collection("users")
        .findOne({ email: managerEmail });

      if (!managerExists) {
        const hashedPassword = await bcrypt.hash(managerPassword, 10);

        await db.collection("users").insertOne({
          name: "Manager",
          email: managerEmail,
          password: hashedPassword,
          role: "manager",
          is_verified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        console.log(`[Database Init] Manager created: ${managerEmail}`);
      }
    }

    console.log(
      "[Database Init] Database structure verified and initialized successfully."
    );

  } catch (err) {
    console.error("[Database Init] Error:", err);
    throw err;
  }
}

async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not configured");
  }

  try {
    await mongoose.connect(uri, {
      dbName: "findmything",
      serverSelectionTimeoutMS: 30000
    });

    console.log(`MongoDB Connected: ${mongoose.connection.name}`);

    await initializeDatabase(mongoose.connection.db);

  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    throw err;
  }
}

module.exports = connectDB;