const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  company: { type: String },
  source: {
    type: String,
    enum: ["Website", "Referral", "Cold Call", "Social Media"],
    required: true,
  },
  status: {
    type: String,
    enum: ["New", "Contacted", "Qualified", "Converted", "Lost"],
    default: "New",
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notes: { type: String },
  convertedToCustomer: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Lead", leadSchema);
