const User = require('../models/User');
const Item = require('../models/Item');
const Collected = require('../models/Collected');
const { getCurrentCycle, parseUserEmail } = require('../utils/helper');

// Submit Lost Item
async function submitLost(req, res) {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect("/login.html");
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect("/login.html");
    }

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      location: "MITS Admin Office",
      lostLocation: req.body.lostlocation,
      dateLost: req.body.dateLost,
      userId: req.session.userId,
      userName: user.name,
      userEmail: user.email,
      contact: req.body.contact,
      type: "lost",
      image: req.file ? req.file.filename : "",
      handedBy: req.body.handedBy,
      handedTo: req.body.handedTo,
      cycle: getCurrentCycle()
    });

    await item.save();
    res.redirect("/items.html");
  } catch (err) {
    console.error("Submit Lost Item Error:", err);
    res.status(500).send("Submit lost item failed");
  }
}

// Submit Found Item
async function submitFound(req, res) {
  try {
    if (!req.session || !req.session.userId) {
      return res.redirect("/login.html");
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect("/login.html");
    }

    const details = parseUserEmail(user.email);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      location: "MITS Admin Office",
      foundLocation: req.body.foundlocation,
      dateFound: req.body.dateFound,
      userId: req.session.userId,
      userName: user.name,
      userEmail: user.email,
      contact: req.body.contact,
      type: "found",
      image: req.file ? req.file.filename : "",
      handedBy: req.body.handedBy,
      handedTo: req.body.handedTo,
      cycle: getCurrentCycle(),
      department: details.department,
      branch: details.branch,
      year: details.year
    });

    await item.save();
    res.redirect("/items.html");
  } catch (err) {
    console.error("Submit Found Item Error:", err);
    res.status(500).send("Submit found item failed");
  }
}

// Get Items API
async function getItems(req, res) {
  try {
    const items = await Item.find({ cycle: getCurrentCycle() }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Get Items Error:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
}

// Get My Items API
async function getMyItems(req, res) {
  try {
    const items = await Item.find({
      userId: req.session.userId,
      cycle: getCurrentCycle()
    });
    res.json(items);
  } catch (err) {
    console.error("Get My Items Error:", err);
    res.status(500).json({ error: "Failed to fetch your items" });
  }
}

// Get Collected Items API
async function getCollectedItems(req, res) {
  try {
    const items = await Collected.find({ cycle: getCurrentCycle() }).sort({ collectedAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Get Collected Items Error:", err);
    res.status(500).json({ error: "Failed to fetch collected items" });
  }
}

module.exports = {
  submitLost,
  submitFound,
  getItems,
  getMyItems,
  getCollectedItems
};
