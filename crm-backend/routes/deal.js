const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getDeals,
  getDeal,
  createDeal,
  updateDeal,
  deleteDeal,
} = require("../controllers/dealController");

// All routes are protected
router.get("/", protect, getDeals);
router.get("/:id", protect, getDeal);
router.post("/", protect, createDeal);
router.put("/:id", protect, updateDeal);
router.delete("/:id", protect, authorize("Admin"), deleteDeal);

module.exports = router;