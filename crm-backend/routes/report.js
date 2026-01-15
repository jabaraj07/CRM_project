const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getDashboard,
  getLeadReports,
  getDealReports,
  getRevenueReports,
} = require("../controllers/reportController");

// All routes are protected
router.get("/dashboard", protect, getDashboard);
router.get("/leads", protect, getLeadReports);
router.get("/deals", protect, getDealReports);
router.get("/revenue", protect, getRevenueReports);

module.exports = router;