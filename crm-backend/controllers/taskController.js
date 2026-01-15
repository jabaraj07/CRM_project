const Task = require("../models/Task");

// @route   GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const query = req.user.role === "Admin" ? {} : { assignedTo: req.user._id };
    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort("-dueDate");

    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @route   GET /api/tasks/:id
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check authorization
    if (
      req.user.role !== "Admin" &&
      task.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @route   POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      priority,
      status,
      dueDate,
      relatedTo,
      relatedId,
      assignedTo,
    } = req.body;

    // Validation
    if (!title || !type || !dueDate || !relatedTo || !relatedId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Sales Users can only assign tasks to themselves
    // Admins can assign to anyone
    let finalAssignedTo = assignedTo || req.user._id;
    if (req.user.role !== "Admin" && assignedTo && assignedTo !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only assign tasks to yourself. Only Admins can assign tasks to other users.",
      });
    }

    const task = await Task.create({
      title,
      description,
      type,
      priority: priority || "Medium",
      status: status || "Pending",
      dueDate,
      relatedTo,
      relatedId,
      assignedTo: finalAssignedTo,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @route   PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check authorization
    if (
      req.user.role !== "Admin" &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Sales Users cannot change task assignment
    // Only Admins can reassign tasks
    const updateData = { ...req.body, updatedAt: Date.now() };
    if (req.user.role !== "Admin" && req.body.assignedTo) {
      // Remove assignedTo from update if Sales User tries to change it
      delete updateData.assignedTo;
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: task });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// @route   DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Only Admins can delete tasks
    // Sales Users should mark tasks as "Cancelled" instead
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only Admins can delete tasks. You can mark tasks as 'Cancelled' instead.",
      });
    }

    await task.deleteOne();
    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

