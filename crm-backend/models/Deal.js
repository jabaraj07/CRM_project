const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  value: { type: Number, required: true },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  stage: {
    type: String,
    enum: [
      "Prospecting",
      "Qualification",
      "Proposal",
      "Negotiation",
      "Closed Won",
      "Closed Lost",
    ],
    default: "Prospecting",
  },
  probability: { type: Number, default: 0 },
  expectedCloseDate: { type: Date },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Deal", dealSchema);
