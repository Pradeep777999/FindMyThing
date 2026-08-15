const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  description: String,

  location: String,
  lostLocation: String,
  foundLocation: String,

  dateLost: String,
  dateFound: String,

  userId: String,
  userName: String,
  userEmail: String,

  contact: String,
  type: String,
  image: String,

  handedBy: String,
  handedTo: String,

  cycle: String,
  department: String,
  branch: String,
  year: String,

  status: { type: String, default: "Available" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Item", itemSchema);
