const Publication = require("../models/Publication");
const Patent = require("../models/Patent");
const ResearchProject = require("../models/ResearchProject");
const Grant = require("../models/Grant");
const Event = require("../models/Event");
const Report = require("../models/Report");
const { generatePdfReport, generateExcelReport } = require("../services/reportService");
const { calculateResearchScore } = require("../utils/score");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const { createAuditLog } = require("../services/auditService");

const getReportRows = async (type, filters) => {
  if (type === "faculty_wise") {
    const query = {};
    if (filters.facultyId) query.submittedBy = filters.facultyId;
    if (filters.year) query.publicationYear = Number(filters.year);
    const publications = await Publication.find(query).populate("submittedBy", "name email");

    return publications.map((p) => ({
      title: p.title,
      type: p.type,
      faculty: p.submittedBy?.name || "-",
      publicationYear: p.publicationYear,
      indexingType: p.indexingType,
      status: p.approvalStatus,
    }));
  }

  if (type === "department_wise") {
    const query = {};
    if (filters.departmentId) query.department = filters.departmentId;
    const projects = await ResearchProject.find(query).populate("department", "name");

    return projects.map((p) => ({
      projectTitle: p.projectTitle,
      department: p.department?.name || "-",
      fundingAgency: p.fundingAgency,
      amountSanctioned: p.amountSanctioned,
      status: p.status,
    }));
  }

  if (type === "year_wise") {
    const query = {};
    if (filters.year) query.publicationYear = Number(filters.year);
    const publications = await Publication.find(query).populate("submittedBy", "name");
    return publications.map((p) => ({
      year: p.publicationYear,
      title: p.title,
      faculty: p.submittedBy?.name || "-",
      indexingType: p.indexingType,
    }));
  }

  if (["naac", "nba", "nirf"].includes(type)) {
    const [publications, patents, projects, grants] = await Promise.all([
      Publication.find({ approvalStatus: "approved" }).populate("submittedBy", "name"),
      Patent.find({ approvalStatus: "approved" }).populate("submittedBy", "name"),
      ResearchProject.find({ approvalStatus: "approved" }).populate("submittedBy", "name"),
      Grant.find({ approvalStatus: "approved" }).populate("submittedBy", "name"),
    ]);

    return [
      ...publications.map((x) => ({ module: "Publication", title: x.title, faculty: x.submittedBy?.name || "-", year: x.publicationYear || "-" })),
      ...patents.map((x) => ({ module: "Patent", title: x.patentTitle, faculty: x.submittedBy?.name || "-", year: x.filingDate ? new Date(x.filingDate).getFullYear() : "-" })),
      ...projects.map((x) => ({ module: "Project", title: x.projectTitle, faculty: x.submittedBy?.name || "-", year: x.startDate ? new Date(x.startDate).getFullYear() : "-" })),
      ...grants.map((x) => ({ module: "Grant", title: x.grantProposal, faculty: x.submittedBy?.name || "-", year: x.createdAt ? new Date(x.createdAt).getFullYear() : "-" })),
    ];
  }

  if (type === "faculty_api_score") {
    const userQuery = { role: "faculty" };
    if (filters.facultyId) userQuery._id = filters.facultyId;
    const faculties = await User.find(userQuery).populate("department", "name");

    const rows = await Promise.all(
      faculties.map(async (faculty) => {
        const [publications, patents, projects, grants, events] = await Promise.all([
          Publication.find({ submittedBy: faculty._id, approvalStatus: "approved" }),
          Patent.find({ submittedBy: faculty._id, approvalStatus: "approved" }),
          ResearchProject.find({ submittedBy: faculty._id, approvalStatus: "approved" }),
          Grant.find({ submittedBy: faculty._id, approvalStatus: "approved" }),
          Event.find({ submittedBy: faculty._id, approvalStatus: "approved" }),
        ]);

        return {
          faculty: faculty.name,
          department: faculty.department?.name || "-",
          publications: publications.length,
          patents: patents.length,
          projects: projects.length,
          grants: grants.length,
          events: events.length,
          apiScore: calculateResearchScore({ publications, patents, projects, grants, events }),
        };
      })
    );

    return rows;
  }

  if (type === "api_score") {
    const userQuery = { role: "faculty" };
    if (filters.facultyId) userQuery._id = filters.facultyId;
    const faculties = await User.find(userQuery).populate("department", "name");

    const rows = await Promise.all(
      faculties.map(async (faculty) => {
        const [publications, patents, projects, grants] = await Promise.all([
          Publication.find({ submittedBy: faculty._id, approvalStatus: "approved" }),
          Patent.find({ submittedBy: faculty._id, approvalStatus: "approved" }),
          ResearchProject.find({ submittedBy: faculty._id, approvalStatus: "approved" }),
          Grant.find({ submittedBy: faculty._id, approvalStatus: "approved" }),
        ]);

        return {
          faculty: faculty.name,
          department: faculty.department?.name || "-",
          publications: publications.length,
          patents: patents.length,
          projects: projects.length,
          grants: grants.length,
          score: calculateResearchScore({ publications, patents, projects, grants }),
        };
      })
    );

    return rows;
  }

  return [];
};

const buildColumns = (rows) => {
  if (!rows.length) return [{ label: "No Data", key: "empty" }];
  return Object.keys(rows[0]).map((k) => ({ label: k.replace(/_/g, " "), key: k }));
};

const generateReport = async (req, res) => {
  const { type, format, filters = {} } = req.body;
  const sanitizedFilters = { ...filters };

  if (req.user.role === "faculty") {
    if (!["faculty_wise", "year_wise", "api_score", "faculty_api_score"].includes(type)) {
      return res.status(403).json({
        success: false,
        message: "Faculty can generate only faculty-wise, year-wise, and API score reports",
      });
    }
    sanitizedFilters.facultyId = req.user._id;
  }

  const rows = await getReportRows(type, sanitizedFilters);
  const columns = buildColumns(rows);

  const meta =
    format === "pdf"
      ? await generatePdfReport({ title: `FRMS ${type} Report`, rows, columns })
      : await generateExcelReport({ sheetName: `${type}_report`, rows, columns });

  const reportPath = meta.fileUrl || `/uploads/reports/${meta.fileName}`;

  const report = await Report.create({
    generatedBy: req.user._id,
    type,
    format,
    filters: sanitizedFilters,
    filePath: reportPath,
  });

  return res.status(201).json({
    success: true,
    message: "Report generated",
    data: { reportId: report._id, filePath: reportPath },
  });
};

const auditedGenerateReport = async (req, res) => {
  await generateReport(req, res);
  await createAuditLog(req, {
    action: "report_export",
    module: "reports",
    targetType: "report",
    status: "success",
    details: { type: req.body.type, format: req.body.format },
  });
};

const listReports = async (req, res) => {
  const query = req.user.role === "faculty" ? { generatedBy: req.user._id } : {};
  const reports = await Report.find(query).populate("generatedBy", "name email").sort({ createdAt: -1 });
  res.json({ success: true, data: reports });
};

module.exports = {
  generateReport: catchAsync(auditedGenerateReport),
  listReports: catchAsync(listReports),
};
