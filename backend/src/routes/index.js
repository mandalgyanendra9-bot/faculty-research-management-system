const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const facultyRoutes = require("./facultyRoutes");
const publicationRoutes = require("./publicationRoutes");
const projectRoutes = require("./projectRoutes");
const patentRoutes = require("./patentRoutes");
const grantRoutes = require("./grantRoutes");
const eventRoutes = require("./eventRoutes");
const approvalRoutes = require("./approvalRoutes");
const reportRoutes = require("./reportRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const notificationRoutes = require("./notificationRoutes");
const aiRoutes = require("./aiRoutes");
const settingsRoutes = require("./settingsRoutes");
const auditRoutes = require("./auditRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/faculty", facultyRoutes);
router.use("/publications", publicationRoutes);
router.use("/projects", projectRoutes);
router.use("/patents", patentRoutes);
router.use("/grants", grantRoutes);
router.use("/events", eventRoutes);
router.use("/approvals", approvalRoutes);
router.use("/reports", reportRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/notifications", notificationRoutes);
router.use("/ai", aiRoutes);
router.use("/settings", settingsRoutes);
router.use("/audit-logs", auditRoutes);

module.exports = router;
