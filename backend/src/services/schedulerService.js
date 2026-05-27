const cron = require("node-cron");

const Publication = require("../models/Publication");
const ResearchProject = require("../models/ResearchProject");
const Patent = require("../models/Patent");
const Grant = require("../models/Grant");
const Event = require("../models/Event");
const Notification = require("../models/Notification");
const AnalyticsSnapshot = require("../models/AnalyticsSnapshot");
const { analyzeCitationInsights, analyzeTrends } = require("./aiService");

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const createUniqueNotification = async ({ recipient, title, message, type, entityType, entityId }) => {
  if (!recipient) return;
  const exists = await Notification.findOne({
    recipient,
    title,
    entityType,
    entityId,
    createdAt: { $gte: startOfToday() },
  });

  if (exists) return;

  await Notification.create({ recipient, title, message, type, entityType, entityId });
};

const recomputeCitationSnapshots = async () => {
  const publications = await Publication.find({ approvalStatus: "approved" }).lean();
  const data = analyzeCitationInsights(publications);
  await AnalyticsSnapshot.create({ type: "citation", payload: data, generatedAt: new Date() });
};

const refreshTrendSnapshots = async () => {
  const publications = await Publication.find({ approvalStatus: "approved" }).lean();
  const data = analyzeTrends(publications);
  await AnalyticsSnapshot.create({ type: "trend", payload: data, generatedAt: new Date() });
};

const projectDeadlineReminderJob = async () => {
  const now = new Date();
  const limitDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const projects = await ResearchProject.find({
    approvalStatus: { $in: ["pending", "approved"] },
    endDate: { $gte: now, $lte: limitDate },
  }).lean();

  for (const project of projects) {
    const days = Math.ceil((new Date(project.endDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    await createUniqueNotification({
      recipient: project.submittedBy,
      title: "Project deadline reminder",
      message: `Project deadline is in ${days} day(s). Please upload/update progress report.`,
      type: "deadline",
      entityType: "project",
      entityId: project._id,
    });
  }
};

const missingDocumentAlertJob = async () => {
  const modules = [
    { model: Publication, entityType: "publication", field: "documentUrl" },
    { model: ResearchProject, entityType: "project", field: "documentUrl" },
    { model: Patent, entityType: "patent", field: "certificateUrl" },
    { model: Grant, entityType: "grant", field: "documentUrl" },
    { model: Event, entityType: "event", field: "certificateUrl" },
  ];

  for (const moduleInfo of modules) {
    const records = await moduleInfo.model
      .find({
        approvalStatus: { $in: ["pending", "approved"] },
        $or: [{ [moduleInfo.field]: { $exists: false } }, { [moduleInfo.field]: "" }, { [moduleInfo.field]: null }],
      })
      .lean();

    for (const record of records) {
      await createUniqueNotification({
        recipient: record.submittedBy,
        title: `${moduleInfo.entityType} missing document`,
        message: `Your ${moduleInfo.entityType} entry is missing a required document. Please upload it.`,
        type: "missing_document",
        entityType: moduleInfo.entityType,
        entityId: record._id,
      });
    }
  }
};

const withSafeExecution = (label, fn) => async () => {
  try {
    await fn();
    // eslint-disable-next-line no-console
    console.log(`[scheduler] ${label} completed`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[scheduler] ${label} failed`, error.message);
  }
};

const startScheduler = () => {
  if (process.env.ENABLE_SCHEDULER === "false") return;

  cron.schedule("0 */6 * * *", withSafeExecution("citation_recompute", recomputeCitationSnapshots));
  cron.schedule("30 */6 * * *", withSafeExecution("trend_refresh", refreshTrendSnapshots));
  cron.schedule("0 9 * * *", withSafeExecution("project_deadline_reminder", projectDeadlineReminderJob));
  cron.schedule("30 9 * * *", withSafeExecution("missing_document_alert", missingDocumentAlertJob));

  withSafeExecution("startup_citation_recompute", recomputeCitationSnapshots)();
  withSafeExecution("startup_trend_refresh", refreshTrendSnapshots)();
};

module.exports = {
  startScheduler,
  recomputeCitationSnapshots,
  refreshTrendSnapshots,
  projectDeadlineReminderJob,
  missingDocumentAlertJob,
};
