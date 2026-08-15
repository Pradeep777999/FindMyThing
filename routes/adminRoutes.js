const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireManagerApi, requireAdminApi, requireManagerOrAdminApi } = require('../middleware/auth');

router.post("/mark-collected", requireManagerApi, adminController.markCollected);
router.post("/delete-collected", requireAdminApi, adminController.deleteCollected);
router.post("/delete-item", requireAdminApi, adminController.deleteItem);
router.delete("/clear-record/:record_id", requireAdminApi, adminController.clearRecord);
router.get("/api/stats", requireAdminApi, adminController.getStats);
router.get("/api/users", requireAdminApi, adminController.getUsers);
router.post("/delete-user", requireAdminApi, adminController.deleteUser);
router.post("/update-role", requireAdminApi, adminController.updateRole);
router.get("/api/manager/found-items/analytics", requireManagerOrAdminApi, adminController.getAnalytics);

module.exports = router;
