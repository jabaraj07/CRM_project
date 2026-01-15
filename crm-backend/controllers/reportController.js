const Lead = require("../models/Lead");
const Customer = require("../models/Customer");
const Deal = require("../models/Deal");
const Task = require("../models/Task");

// @desc    Get dashboard summary
// @route   GET /api/reports/dashboard
// @access  Private
exports.getDashboard = async (req, res) => {
  try {
    const query = req.user.role === "Admin" ? {} : { assignedTo: req.user._id };

    const [leads, customers, deals, tasks] = await Promise.all([
      Lead.find(query),
      Customer.find(query),
      Deal.find(query),
      Task.find(query),
    ]);

    const leadsByStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    const dealsByStage = deals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {});

    const tasksByStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    const totalRevenue = deals
      .filter((deal) => deal.stage === "Closed Won")
      .reduce((sum, deal) => sum + deal.value, 0);

    const conversionRate =
      leads.length > 0
        ? (
            (leads.filter((l) => l.status === "Converted").length /
              leads.length) *
            100
          ).toFixed(2)
        : 0;

    res.json({
      success: true,
      data: {
        totalLeads: leads.length,
        totalCustomers: customers.length,
        totalDeals: deals.length,
        totalTasks: tasks.length,
        totalRevenue,
        conversionRate,
        leadsByStatus,
        dealsByStage,
        tasksByStatus,
        recentLeads: leads.slice(0, 5),
        recentDeals: deals.slice(0, 5),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Get lead reports
// @route   GET /api/reports/leads
// @access  Private
exports.getLeadReports = async (req, res) => {
  try {
    const query = req.user.role === "Admin" ? {} : { assignedTo: req.user._id };
    const leads = await Lead.find(query);

    const byStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    const bySource = leads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total: leads.length,
        byStatus,
        bySource,
        conversionRate:
          leads.length > 0
            ? (
                (leads.filter((l) => l.status === "Converted").length /
                  leads.length) *
                100
              ).toFixed(2)
            : 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Get deal reports
// @route   GET /api/reports/deals
// @access  Private
exports.getDealReports = async (req, res) => {
  try {
    const query = req.user.role === "Admin" ? {} : { assignedTo: req.user._id };
    const deals = await Deal.find(query);

    const byStage = deals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {});

    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const wonDeals = deals.filter((d) => d.stage === "Closed Won");
    const wonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);

    res.json({
      success: true,
      data: {
        total: deals.length,
        byStage,
        totalValue,
        wonDeals: wonDeals.length,
        wonValue,
        winRate:
          deals.length > 0
            ? ((wonDeals.length / deals.length) * 100).toFixed(2)
            : 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @desc    Get revenue reports
// @route   GET /api/reports/revenue
// @access  Private
exports.getRevenueReports = async (req, res) => {
  try {
    const query = req.user.role === "Admin" ? {} : { assignedTo: req.user._id };
    const deals = await Deal.find({ ...query, stage: "Closed Won" }).populate(
      "customer",
      "name"
    );

    const byMonth = deals.reduce((acc, deal) => {
      const month = new Date(deal.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      acc[month] = (acc[month] || 0) + deal.value;
      return acc;
    }, {});

    const totalRevenue = deals.reduce((sum, deal) => sum + deal.value, 0);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalDeals: deals.length,
        averageDealSize:
          deals.length > 0 ? (totalRevenue / deals.length).toFixed(2) : 0,
        byMonth,
        topDeals: deals.sort((a, b) => b.value - a.value).slice(0, 10),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

