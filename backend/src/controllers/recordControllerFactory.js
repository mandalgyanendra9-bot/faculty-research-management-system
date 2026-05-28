const { calculatePublicationScore } = require("../utils/score");
const catchAsync = require("../utils/catchAsync");
const { createNotification, createRoleNotifications } = require("../services/notificationService");
const { createAuditLog } = require("../services/auditService");
const { resolveUploadUrl } = require("../services/fileStorageService");

const canEditRecord = (record, user) => {
  if (["admin", "super_admin"].includes(user.role)) return true;
  if (record.submittedBy?.toString() !== user._id.toString()) return false;
  return record.approvalStatus === "pending";
};

const normalizePayload = (payload) => {
  const normalized = { ...payload };
  ["authors", "coInvestigators", "inventors"].forEach((key) => {
    if (typeof normalized[key] === "string") {
      normalized[key] = normalized[key]
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  });

  ["publicationYear", "impactFactor", "citationCount", "amountSanctioned", "amountRequested", "amountApproved"].forEach((key) => {
    if (normalized[key] !== undefined && normalized[key] !== "") {
      normalized[key] = Number(normalized[key]);
    }
  });

  ["startDate", "endDate", "filingDate", "grantDate", "date"].forEach((key) => {
    if (normalized[key]) normalized[key] = new Date(normalized[key]);
  });

  return normalized;
};

const buildRecordController = ({ model, entityName }) => {
  const list = async (req, res) => {
    const { page = 1, limit = 10, search = "", status, year, department, mine } = req.query;
    const query = {};

    if (status) query.approvalStatus = status;
    if (department) query.department = department;
    if (year && entityName === "publication") query.publicationYear = Number(year);
    if (search) {
      query.$or =
        entityName === "publication"
          ? [{ title: { $regex: search, $options: "i" } }, { journalOrConferenceName: { $regex: search, $options: "i" } }]
          : [{ projectTitle: { $regex: search, $options: "i" } }, { patentTitle: { $regex: search, $options: "i" } }, { grantProposal: { $regex: search, $options: "i" } }, { eventName: { $regex: search, $options: "i" } }];
    }

    if (mine === "true") query.submittedBy = req.user._id;
    if (req.user.role === "faculty") query.submittedBy = req.user._id;

    const [items, total] = await Promise.all([
      model
        .find(query)
        .populate("submittedBy", "name email")
        .populate("department", "name code")
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit)),
      model.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  };

  const getById = async (req, res) => {
    const item = await model.findById(req.params.id).populate("submittedBy", "name email");
    if (!item) return res.status(404).json({ success: false, message: `${entityName} not found` });
    return res.json({ success: true, data: item });
  };

  const create = async (req, res) => {
    const payload = {
      ...normalizePayload(req.body),
      submittedBy: req.user._id,
      department: req.user.department || req.body.department,
    };

    if (req.file) {
      const uploaded = await resolveUploadUrl(req.file, {
        folder: `frms/${entityName}`,
        resourceType: "raw",
      });
      if (entityName === "patent" || entityName === "event") {
        payload.certificateUrl = uploaded?.url;
      } else {
        payload.documentUrl = uploaded?.url;
      }
    }

    const item = await model.create(payload);

    if (entityName === "publication") {
      item.score = calculatePublicationScore(item);
      await item.save();
    }

    await createNotification({
      recipient: item.submittedBy,
      title: `${entityName} submitted`,
      message: `Your ${entityName} is submitted and pending approval`,
      type: "approval",
      entityType: entityName,
      entityId: item._id,
    });

    await createRoleNotifications({
      roles: ["hod_dean", "admin", "super_admin", "research_coordinator"],
      title: `${entityName} needs approval`,
      message: `A new ${entityName} submission is pending review.`,
      type: "approval",
      entityType: entityName,
      entityId: item._id,
      excludeUserId: item.submittedBy,
    });

    const hasDocument =
      entityName === "patent" || entityName === "event" ? Boolean(item.certificateUrl) : Boolean(item.documentUrl);
    if (!hasDocument) {
      await createNotification({
        recipient: item.submittedBy,
        title: `${entityName} missing document`,
        message: `Please upload supporting document(s) for your ${entityName} submission.`,
        type: "missing_document",
        entityType: entityName,
        entityId: item._id,
      });
    }

    if (entityName === "project" && item.endDate) {
      const msToDeadline = new Date(item.endDate).getTime() - Date.now();
      const daysToDeadline = Math.ceil(msToDeadline / (1000 * 60 * 60 * 24));
      if (daysToDeadline >= 0 && daysToDeadline <= 30) {
        await createNotification({
          recipient: item.submittedBy,
          title: "Project deadline reminder",
          message: `Project deadline is in ${daysToDeadline} day(s). Please update progress/report.`,
          type: "deadline",
          entityType: entityName,
          entityId: item._id,
        });
      }
    }

    res.status(201).json({ success: true, message: `${entityName} created`, data: item });
  };

  const update = async (req, res) => {
    const item = await model.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: `${entityName} not found` });

    if (!canEditRecord(item, req.user)) {
      return res.status(403).json({ success: false, message: "Cannot edit this record" });
    }

    Object.assign(item, normalizePayload(req.body));
    if (req.file) {
      const uploaded = await resolveUploadUrl(req.file, {
        folder: `frms/${entityName}`,
        resourceType: "raw",
      });
      if (entityName === "patent" || entityName === "event") {
        item.certificateUrl = uploaded?.url;
      } else {
        item.documentUrl = uploaded?.url;
      }
    }

    if (entityName === "publication") item.score = calculatePublicationScore(item);

    if (item.approvalStatus !== "approved") {
      item.approvalStatus = "pending";
      item.rejectionReason = undefined;
      item.verifiedBy = undefined;
      item.approvedBy = undefined;
    }

    await item.save();

    const hasDocument =
      entityName === "patent" || entityName === "event" ? Boolean(item.certificateUrl) : Boolean(item.documentUrl);
    if (!hasDocument) {
      await createNotification({
        recipient: item.submittedBy,
        title: `${entityName} missing document`,
        message: `Your ${entityName} record does not have supporting documents.`,
        type: "missing_document",
        entityType: entityName,
        entityId: item._id,
      });
    }

    if (entityName === "project" && item.endDate) {
      const msToDeadline = new Date(item.endDate).getTime() - Date.now();
      const daysToDeadline = Math.ceil(msToDeadline / (1000 * 60 * 60 * 24));
      if (daysToDeadline >= 0 && daysToDeadline <= 30) {
        await createNotification({
          recipient: item.submittedBy,
          title: "Project deadline reminder",
          message: `Project deadline is in ${daysToDeadline} day(s). Please update progress/report.`,
          type: "deadline",
          entityType: entityName,
          entityId: item._id,
        });
      }
    }

    res.json({ success: true, message: `${entityName} updated`, data: item });
  };

  const remove = async (req, res) => {
    const item = await model.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: `${entityName} not found` });

    if (!canEditRecord(item, req.user)) {
      return res.status(403).json({ success: false, message: "Cannot delete this record" });
    }

    await item.deleteOne();

    await createAuditLog(req, {
      action: "delete",
      module: entityName,
      targetType: entityName,
      targetId: item._id,
      status: "success",
      details: { title: item.title || item.projectTitle || item.patentTitle || item.grantProposal || item.eventName },
    });

    res.json({ success: true, message: `${entityName} deleted` });
  };

  const approveWorkflow = async (req, res) => {
    const { status, rejectionReason } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const item = await model.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: `${entityName} not found` });

    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({ success: false, message: "Rejection reason required" });
    }

    if (req.user.role === "hod_dean") {
      item.verifiedBy = req.user._id;
      item.verifiedAt = new Date();
      item.approvalStatus = status === "approved" ? "pending" : status;
      item.rejectionReason = status === "rejected" ? rejectionReason : undefined;
    }

    if (["admin", "super_admin"].includes(req.user.role)) {
      item.approvedBy = req.user._id;
      item.approvedAt = new Date();
      item.approvalStatus = status;
      item.rejectionReason = status === "rejected" ? rejectionReason : undefined;
    }

    await item.save();

    await createAuditLog(req, {
      action: status === "rejected" ? "reject" : "approve",
      module: entityName,
      targetType: entityName,
      targetId: item._id,
      status: "success",
      details: {
        status: item.approvalStatus,
        rejectionReason: item.rejectionReason,
      },
    });

    await createNotification({
      recipient: item.submittedBy,
      title: `${entityName} ${item.approvalStatus}`,
      message:
        item.approvalStatus === "rejected"
          ? `Your ${entityName} was rejected. Reason: ${item.rejectionReason}`
          : `Your ${entityName} status updated to ${item.approvalStatus}`,
      type: "status_update",
      entityType: entityName,
      entityId: item._id,
    });

    return res.json({ success: true, message: `${entityName} status updated`, data: item });
  };

  return {
    list: catchAsync(list),
    getById: catchAsync(getById),
    create: catchAsync(create),
    update: catchAsync(update),
    remove: catchAsync(remove),
    approveWorkflow: catchAsync(approveWorkflow),
  };
};

module.exports = { buildRecordController };
