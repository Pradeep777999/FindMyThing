const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireManagerApi, requireAdminApi, requireManagerOrAdminApi } = require('../middleware/auth');

router.post("/mark-collected", requireManagerApi, adminController.markCollected);
router.post("/delete-collected", requireAdminApi, adminController.deleteCollected);
router.delete("/clear-record/:record_id", requireAdminApi, adminController.clearRecord);
router.get("/api/stats", requireAdminApi, adminController.getStats);
router.get("/api/manager/found-items/analytics", requireManagerOrAdminApi, adminController.getAnalytics);

module.exports = router;
