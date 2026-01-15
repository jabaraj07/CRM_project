const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
} = require("../controllers/leadController");

// All routes are protected
router.get("/", protect, getLeads);
router.get("/:id", protect, getLead);
router.post("/", protect, createLead);
router.put("/:id", protect, updateLead);
router.delete("/:id", protect, authorize("Admin"), deleteLead);
router.post("/:id/convert", protect, convertLead);

module.exports = router;
