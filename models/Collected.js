const mongoose = require('mongoose');

const collectedSchema = new mongoose.Schema({
  name: String,
  description: String,

  location: String,
  lostLocation: String,
  foundLocation: String,

  userName: String,
  userEmail: String,

  type: String,
  image: String,

  handedBy: String,
  handedTo: String,

  cycle: String,
  department: String,
  branch: String,
  year: String,
  dateLost: String,
  dateFound: String,

  collectedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Collected", collectedSchema);
