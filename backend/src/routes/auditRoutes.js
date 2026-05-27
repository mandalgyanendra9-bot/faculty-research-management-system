const express = require("express");
const AuditLog = require("../models/AuditLog");
const { protect, authorize } = require("../middlewares/auth");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

const router = express.Router();

router.use(protect, authorize("super_admin", "admin"));

router.get(
  "/",
  catchAsync(async (req, res) => {
    const {
      module,
      action,
      actorEmail,
      user,
      search,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20,
    } = req.query;
    const query = {};
    if (module) query.module = module;
    if (action) query.action = action;
    if (actorEmail) query.actorEmail = { $regex: actorEmail, $options: "i" };
    if (user) query.actorEmail = { $regex: user, $options: "i" };

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(`${dateFrom}T00:00:00.000Z`);
      if (dateTo) query.createdAt.$lte = new Date(`${dateTo}T23:59:59.999Z`);
    }

    if (search) {
      const orQuery = [
        { actorEmail: { $regex: search, $options: "i" } },
        { module: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
      ];

      if (mongoose.isValidObjectId(search)) {
        orQuery.push({ targetId: search });
      }

      query.$or = orQuery;
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate("actor", "name email role")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      AuditLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  })
);

module.exports = router;
