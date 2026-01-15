const Customer = require("../models/Customer");

// @route   GET /api/customers
exports.getCustomers = async (req, res) => {
  try {
    const query = req.user.role === "Admin" ? {} : { assignedTo: req.user._id };
    const customers = await Customer.find(query)
      .populate("assignedTo", "name email")
      .populate("leadId")
      .sort("-createdAt");

    res.json({ success: true, data: customers });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @route   GET /api/customers/:id
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("leadId");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check authorization
    if (
      req.user.role !== "Admin" &&
      customer.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @route   PUT /api/customers/:id
exports.updateCustomer = async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check authorization
    if (
      req.user.role !== "Admin" &&
      customer.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Sales Users cannot change customer assignment
    // Only Admins can reassign customers
    const updateData = { ...req.body, updatedAt: Date.now() };
    if (req.user.role !== "Admin" && req.body.assignedTo) {
      // Remove assignedTo from update if Sales User tries to change it
      delete updateData.assignedTo;
    }

    customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: customer });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @route   DELETE /api/customers/:id
exports.deleteCustomer = async (req, res) => {
  try {
    const Deal = require("../models/Deal");
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check if customer has deals
    const dealsCount = await Deal.countDocuments({ customer: customer._id });
    
    // Prevent deletion if customer has deals or revenue
    if (dealsCount > 0 || (customer.totalRevenue && customer.totalRevenue > 0)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete customer. This customer has ${dealsCount} deal(s) and $${(customer.totalRevenue || 0).toLocaleString()} in revenue. Deleting this customer would affect deal records, revenue data, and historical reports. If you need to correct data, please edit the customer instead.`,
      });
    }

    await customer.deleteOne();
    res.json({ success: true, message: "Customer deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

