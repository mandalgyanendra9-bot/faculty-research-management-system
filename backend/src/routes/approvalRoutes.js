const express = require("express");
const Publication = require("../models/Publication");
const Patent = require("../models/Patent");
const ResearchProject = require("../models/ResearchProject");
const Grant = require("../models/Grant");
const Event = require("../models/Event");
const { protect, authorize } = require("../middlewares/auth");
const catchAsync = require("../utils/catchAsync");

const router = express.Router();

router.use(protect, authorize("super_admin", "admin", "hod_dean", "research_coordinator"));

router.get(
  "/pending",
  catchAsync(async (_req, res) => {
  const [publications, patents, projects, grants, events] = await Promise.all([
    Publication.find({ approvalStatus: "pending" }).populate("submittedBy", "name email"),
    Patent.find({ approvalStatus: "pending" }).populate("submittedBy", "name email"),
    ResearchProject.find({ approvalStatus: "pending" }).populate("submittedBy", "name email"),
    Grant.find({ approvalStatus: "pending" }).populate("submittedBy", "name email"),
    Event.find({ approvalStatus: "pending" }).populate("submittedBy", "name email"),
  ]);

  res.json({
    success: true,
    data: {
      publications,
      patents,
      projects,
      grants,
      events,
      counts: {
        publications: publications.length,
        patents: patents.length,
        projects: projects.length,
        grants: grants.length,
        events: events.length,
      },
    },
  });
  })
);

module.exports = router;
