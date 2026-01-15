const Deal = require("../models/Deal");
const Customer = require("../models/Customer");

// @desc    Get all deals
// @route   GET /api/deals
// @access  Private
exports.getDeals = async (req, res) => {
  try {
    const query = req.user.role === "Admin" ? {} : { assignedTo: req.user._id };
    const deals = await Deal.find(query)
      .populate("customer", "name email company")
      .populate("assignedTo", "name email")
      .sort("-createdAt");

    res.json({ success: true, data: deals });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Get single deal
// @route   GET /api/deals/:id
// @access  Private
exports.getDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate("customer", "name email company")
      .populate("assignedTo", "name email");

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    // Check authorization
    if (
      req.user.role !== "Admin" &&
      deal.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.json({ success: true, data: deal });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Create deal
// @route   POST /api/deals
// @access  Private
exports.createDeal = async (req, res) => {
  try {
    const {
      title,
      value,
      customer,
      stage,
      probability,
      expectedCloseDate,
      assignedTo,
      notes,
    } = req.body;

    // Validation
    if (!title || !value || !customer) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if customer exists
    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Sales Users can only create deals for customers assigned to them
    // Admins can create deals for any customer
    if (req.user.role !== "Admin") {
      if (!customerExists.assignedTo || customerExists.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only create deals for customers assigned to you. Only Admins can create deals for any customer.",
        });
      }
    }

    // Sales Users can only assign deals to themselves
    // Admins can assign to anyone
    let finalAssignedTo = assignedTo || req.user._id;
    if (req.user.role !== "Admin" && assignedTo && assignedTo !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only assign deals to yourself. Only Admins can assign deals to other users.",
      });
    }

    const deal = await Deal.create({
      title,
      value,
      customer,
      stage,
      probability: probability || 0,
      expectedCloseDate,
      assignedTo: finalAssignedTo,
      notes,
    });

    // Update customer stats
    if (stage === "Closed Won") {
      await Customer.findByIdAndUpdate(customer, {
        $inc: { totalDeals: 1, totalRevenue: value },
      });
    } else {
      await Customer.findByIdAndUpdate(customer, {
        $inc: { totalDeals: 1 },
      });
    }

    res.status(201).json({ success: true, data: deal });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Update deal
// @route   PUT /api/deals/:id
// @access  Private
exports.updateDeal = async (req, res) => {
  try {
    let deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    // Check authorization
    if (
      req.user.role !== "Admin" &&
      deal.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Prevent editing closed deals (Closed Won or Closed Lost)
    // Only Admins can edit closed deals for corrections
    if ((deal.stage === "Closed Won" || deal.stage === "Closed Lost") && req.user.role !== "Admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot edit closed deals. Only Admins can make corrections to closed deals.",
      });
    }

    const oldStage = deal.stage;
    const oldValue = deal.value;

    // Sales Users cannot change deal assignment or customer
    // Only Admins can reassign deals or change customer
    const updateData = { ...req.body, updatedAt: Date.now() };
    if (req.user.role !== "Admin") {
      // Remove assignment fields if Sales User tries to change them
      if (req.body.assignedTo) {
        delete updateData.assignedTo;
      }
      if (req.body.customer) {
        delete updateData.customer;
      }
    }

    deal = await Deal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Update customer revenue if deal stage changes
    if (req.body.stage === "Closed Won" && oldStage !== "Closed Won") {
      await Customer.findByIdAndUpdate(deal.customer, {
        $inc: { totalRevenue: deal.value },
      });
    } else if (oldStage === "Closed Won" && req.body.stage !== "Closed Won") {
      await Customer.findByIdAndUpdate(deal.customer, {
        $inc: { totalRevenue: -oldValue },
      });
    } else if (
      req.body.stage === "Closed Won" &&
      req.body.value !== oldValue
    ) {
      await Customer.findByIdAndUpdate(deal.customer, {
        $inc: { totalRevenue: deal.value - oldValue },
      });
    }

    res.json({ success: true, data: deal });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Delete deal
// @route   DELETE /api/deals/:id
// @access  Private/Admin
exports.deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    // Prevent deletion of closed deals (or require explicit confirmation)
    // Closed deals represent finalized sales and should be preserved for records
    if (deal.stage === "Closed Won" || deal.stage === "Closed Lost") {
      return res.status(400).json({
        success: false,
        message: `Cannot delete closed deals. This deal is marked as "${deal.stage}". Deleting closed deals would affect revenue records and historical data. If you need to correct data, please edit the deal instead.`,
      });
    }

    // Update customer stats
    await Customer.findByIdAndUpdate(deal.customer, {
      $inc: {
        totalDeals: -1,
        totalRevenue: deal.stage === "Closed Won" ? -deal.value : 0,
      },
    });

    await deal.deleteOne();
    res.json({ success: true, message: "Deal deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

