const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

// All routes are protected
router.get("/", protect, getCustomers);
router.get("/:id", protect, getCustomer);
router.put("/:id", protect, updateCustomer);
router.delete("/:id", protect, authorize("Admin"), deleteCustomer);

module.exports = router;