const Lead = require("../models/Lead");
const Customer = require("../models/Customer");

// @route   GET /api/leads
exports.getLeads = async (req, res) => {
  try {
    const query = req.user.role === "Admin" ? {} : { assignedTo: req.user._id };
    const leads = await Lead.find(query).populate("assignedTo", "name email");
    res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// @route   GET /api/leads/:id
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate(
      "assignedTo",
      "name email"
    );
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Check authorization
    if (
      req.user.role !== "Admin" &&
      lead.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this lead",
      });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// @route   POST /api/leads
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, company, source, assignedTo, notes } = req.body;

    // Validation
    if (!name || !email || !phone || !source) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Sales Users can only assign leads to themselves
    // Admins can assign to anyone
    let finalAssignedTo = assignedTo || req.user._id;
    if (req.user.role !== "Admin" && assignedTo && assignedTo !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only assign leads to yourself. Only Admins can assign leads to other users.",
      });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      source,
      assignedTo: finalAssignedTo,
      notes,
    });

    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// @route   PUT /api/leads/:id
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Check authorization
    if (
      req.user.role !== "Admin" &&
      lead.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this lead",
      });
    }

    // Sales Users cannot change lead assignment
    // Only Admins can reassign leads
    const updateData = { ...req.body, updatedAt: Date.now() };
    if (req.user.role !== "Admin" && req.body.assignedTo) {
      // Remove assignedTo from update if Sales User tries to change it
      delete updateData.assignedTo;
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedLead });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// @route   DELETE /api/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    await lead.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Lead deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// @route   POST /api/leads/:id/convert
exports.convertLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (lead.convertedToCustomer) {
      return res.status(400).json({
        success: false,
        message: "Lead already converted",
      });
    }

    // Create customer from lead
    const customer = await Customer.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      leadId: lead._id,
      assignedTo: lead.assignedTo,
    });

    // Update lead status
    lead.status = "Converted";
    lead.convertedToCustomer = true;
    await lead.save();

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

