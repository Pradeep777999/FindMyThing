const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { requireLoginView } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post("/lost", requireLoginView, upload.single("image"), itemController.submitLost);
router.post("/found", requireLoginView, upload.single("image"), itemController.submitFound);
router.get("/api/items", itemController.getItems);
router.get("/api/my-items", requireLoginView, itemController.getMyItems);
router.get("/api/collected", itemController.getCollectedItems);

module.exports = router;
