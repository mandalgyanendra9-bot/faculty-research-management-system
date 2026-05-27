const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const Publication = require("../models/Publication");
const ResearchProject = require("../models/ResearchProject");
const Patent = require("../models/Patent");
const Grant = require("../models/Grant");
const Event = require("../models/Event");
const User = require("../models/User");
const FacultyProfile = require("../models/FacultyProfile");
const AIResearchPaper = require("../models/AIResearchPaper");
const AISemanticDocument = require("../models/AISemanticDocument");
const PlagiarismReport = require("../models/PlagiarismReport");
const catchAsync = require("../utils/catchAsync");
const { calculateResearchScore } = require("../utils/score");
const {
  generateResearchSummary,
  getPublicationRecommendations,
  analyzeTrends,
  analyzeCitationInsights,
  createEmbedding,
  cosineSimilarity,
  smartSearchFallback,
  generateProposalDraft,
  buildAssistantResponse,
  predictScore,
  extractTextFromPdf,
  extractTextWithOcr,
  frequencyKeywords,
} = require("../services/aiService");

const ensureReportsDir = () => {
  const reportDir = path.join(__dirname, "..", "uploads", "reports");
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  return reportDir;
};

const generatePaperSummary = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "PDF file is required" });
  }
  if (req.file.mimetype !== "application/pdf") {
    return res.status(400).json({ success: false, message: "Only PDF papers are supported for AI summary" });
  }

  const fullPath = req.file.path;
  const extractedText = await extractTextFromPdf(fullPath);
  const summary = await generateResearchSummary(extractedText);

  const paper = await AIResearchPaper.create({
    uploadedBy: req.user._id,
    title: req.body.title || req.file.originalname,
    fileUrl: `/uploads/${req.file.filename}`,
    extractedText,
    abstractSummary: summary.abstractSummary,
    keyFindings: summary.keyFindings,
    keywords: summary.keywords,
    contributionSummary: summary.contributionSummary,
  });

  const semanticPayload = {
    sourceType: "paper",
    sourceId: paper._id,
    faculty: req.user._id,
    department: req.user.department,
    title: paper.title,
    content: extractedText.slice(0, 15000),
    keywords: summary.keywords,
    metadata: { fileUrl: paper.fileUrl },
  };

  try {
    semanticPayload.embedding = (await createEmbedding(`${paper.title}\n${semanticPayload.content}`)) || [];
  } catch (_error) {
    semanticPayload.embedding = [];
  }

  await AISemanticDocument.create(semanticPayload);

  return res.status(201).json({
    success: true,
    message: "AI summary generated",
    data: {
      paperId: paper._id,
      title: paper.title,
      fileUrl: paper.fileUrl,
      abstractSummary: paper.abstractSummary,
      keyFindings: paper.keyFindings,
      keywords: paper.keywords,
      contributionSummary: paper.contributionSummary,
    },
  });
});

const recommendationForFaculty = catchAsync(async (req, res) => {
  let researchArea = req.body.researchArea;

  if (!researchArea) {
    const profile = await FacultyProfile.findOne({ user: req.user._id }).lean();
    const fallbackArea = [
      ...(profile?.areaOfExpertise || []),
      ...(profile?.researchInterests || []),
    ].join(" ");
    researchArea = fallbackArea || "applied research";
  }

  const data = await getPublicationRecommendations(researchArea);
  res.json({ success: true, data: { researchArea, ...data } });
});

const trendAnalysis = catchAsync(async (_req, res) => {
  const publications = await Publication.find({ approvalStatus: "approved" }).lean();
  const departments = await User.find({ role: "faculty" }).populate("department", "name").lean();
  const deptMap = new Map(departments.map((faculty) => [String(faculty._id), faculty.department?.name || "N/A"]));

  const base = analyzeTrends(publications);

  const departmentTrendMap = {};
  publications.forEach((pub) => {
    const deptName = deptMap.get(String(pub.submittedBy)) || "N/A";
    if (!departmentTrendMap[deptName]) departmentTrendMap[deptName] = {};
    const year = pub.publicationYear || new Date(pub.createdAt || Date.now()).getFullYear();
    departmentTrendMap[deptName][year] = (departmentTrendMap[deptName][year] || 0) + 1;
  });

  const departmentTrendCharts = Object.entries(departmentTrendMap).map(([department, yearly]) => ({
    department,
    years: Object.entries(yearly)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([year, count]) => ({ year: Number(year), count })),
  }));

  res.json({
    success: true,
    data: {
      ...base,
      departmentTrendCharts,
    },
  });
});

const citationInsights = catchAsync(async (_req, res) => {
  const publications = await Publication.find({ approvalStatus: "approved" }).lean();
  const data = analyzeCitationInsights(publications);
  res.json({ success: true, data });
});

const getCorpusDocuments = async () => {
  const [publications, projects, patents, grants, papers] = await Promise.all([
    Publication.find({ approvalStatus: "approved" }).lean(),
    ResearchProject.find({ approvalStatus: "approved" }).lean(),
    Patent.find({ approvalStatus: "approved" }).lean(),
    Grant.find({ approvalStatus: "approved" }).lean(),
    AIResearchPaper.find().lean(),
  ]);

  return [
    ...publications.map((item) => ({
      sourceType: "publication",
      sourceId: item._id,
      title: item.title,
      content: `${item.title} ${item.journalOrConferenceName || ""} ${(item.aiKeywords || []).join(" ")}`,
      keywords: item.aiKeywords?.length ? item.aiKeywords : frequencyKeywords(item.title || "", 6),
      faculty: item.submittedBy,
      department: item.department,
    })),
    ...projects.map((item) => ({
      sourceType: "project",
      sourceId: item._id,
      title: item.projectTitle,
      content: `${item.projectTitle} ${item.fundingAgency || ""} ${item.progressReport || ""}`,
      keywords: frequencyKeywords(`${item.projectTitle} ${item.progressReport || ""}`, 6),
      faculty: item.submittedBy,
      department: item.department,
    })),
    ...patents.map((item) => ({
      sourceType: "patent",
      sourceId: item._id,
      title: item.patentTitle,
      content: `${item.patentTitle} ${(item.inventors || []).join(" ")} ${item.applicationNumber || ""}`,
      keywords: frequencyKeywords(`${item.patentTitle} ${(item.inventors || []).join(" ")}`, 6),
      faculty: item.submittedBy,
      department: item.department,
    })),
    ...grants.map((item) => ({
      sourceType: "grant",
      sourceId: item._id,
      title: item.grantProposal,
      content: `${item.grantProposal} ${item.agencyName || ""} ${item.statusTracking || ""}`,
      keywords: frequencyKeywords(`${item.grantProposal} ${item.agencyName || ""}`, 6),
      faculty: item.submittedBy,
      department: item.department,
    })),
    ...papers.map((item) => ({
      sourceType: "paper",
      sourceId: item._id,
      title: item.title,
      content: item.extractedText?.slice(0, 15000) || item.abstractSummary || "",
      keywords: item.keywords || [],
      faculty: item.uploadedBy,
      department: null,
    })),
  ];
};

const syncSemanticIndex = catchAsync(async (_req, res) => {
  const corpus = await getCorpusDocuments();

  for (const doc of corpus) {
    const query = { sourceType: doc.sourceType, sourceId: doc.sourceId };
    const existing = await AISemanticDocument.findOne(query);

    let embedding = existing?.embedding || [];
    if (!embedding.length) {
      try {
        embedding = (await createEmbedding(`${doc.title}\n${doc.content.slice(0, 6000)}`)) || [];
      } catch (_error) {
        embedding = [];
      }
    }

    await AISemanticDocument.findOneAndUpdate(
      query,
      {
        $set: {
          ...doc,
          embedding,
          metadata: { syncedAt: new Date().toISOString() },
        },
      },
      { upsert: true, new: true }
    );
  }

  res.json({ success: true, message: "Semantic index synchronized", data: { documents: corpus.length } });
});

const smartSearch = catchAsync(async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ success: false, message: "Query is required" });

  let docs = await AISemanticDocument.find().limit(800).lean();
  if (!docs.length) {
    const corpus = await getCorpusDocuments();
    docs = corpus;
  }

  let results = [];

  try {
    const qEmbedding = await createEmbedding(query);
    if (qEmbedding) {
      results = docs
        .map((doc) => ({
          ...doc,
          score: cosineSimilarity(qEmbedding, doc.embedding || []),
        }))
        .filter((doc) => doc.score > 0.15)
        .sort((a, b) => b.score - a.score);
    }
  } catch (_error) {
    results = [];
  }

  if (!results.length) {
    results = smartSearchFallback(query, docs);
  }

  res.json({
    success: true,
    data: results.slice(0, 20).map((doc) => ({
      sourceType: doc.sourceType,
      sourceId: doc.sourceId,
      title: doc.title,
      keywords: doc.keywords,
      score: Number((doc.score || 0).toFixed(4)),
    })),
  });
});

const uploadPlagiarism = catchAsync(async (req, res) => {
  const { publicationId, similarityPercentage, notes } = req.body;
  if (!publicationId || similarityPercentage === undefined) {
    return res.status(400).json({ success: false, message: "publicationId and similarityPercentage are required" });
  }

  const publication = await Publication.findById(publicationId);
  if (!publication) return res.status(404).json({ success: false, message: "Publication not found" });

  const similarity = Number(similarityPercentage);
  if (Number.isNaN(similarity) || similarity < 0 || similarity > 100) {
    return res.status(400).json({ success: false, message: "similarityPercentage must be between 0 and 100" });
  }
  const flagged = similarity >= Number(process.env.PLAGIARISM_THRESHOLD || 30);

  const report = await PlagiarismReport.create({
    publication: publication._id,
    submittedBy: req.user._id,
    similarityPercentage: similarity,
    flagged,
    notes,
    reportUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
  });

  publication.plagiarismSimilarity = similarity;
  publication.plagiarismFlagged = flagged;
  await publication.save();

  res.status(201).json({ success: true, data: report, message: flagged ? "High similarity flagged" : "Plagiarism report saved" });
});

const listPlagiarismReports = catchAsync(async (_req, res) => {
  const reports = await PlagiarismReport.find()
    .populate("publication", "title publicationYear")
    .populate("submittedBy", "name email")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: reports });
});

const proposalAssistant = catchAsync(async (req, res) => {
  const draft = await generateProposalDraft(req.body || {});
  res.json({ success: true, data: draft });
});

const generateFacultyCv = catchAsync(async (req, res) => {
  const facultyId = req.params.facultyId || req.user._id;
  if (req.user.role === "faculty" && String(facultyId) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: "Faculty can generate only their own CV" });
  }

  const [user, profile, publications, projects, patents, grants, events] = await Promise.all([
    User.findById(facultyId).populate("department", "name code"),
    FacultyProfile.findOne({ user: facultyId }),
    Publication.find({ submittedBy: facultyId, approvalStatus: "approved" }).sort({ publicationYear: -1 }),
    ResearchProject.find({ submittedBy: facultyId, approvalStatus: "approved" }).sort({ createdAt: -1 }),
    Patent.find({ submittedBy: facultyId, approvalStatus: "approved" }).sort({ createdAt: -1 }),
    Grant.find({ submittedBy: facultyId, approvalStatus: "approved" }).sort({ createdAt: -1 }),
    Event.find({ submittedBy: facultyId, approvalStatus: "approved" }).sort({ date: -1 }),
  ]);

  if (!user) return res.status(404).json({ success: false, message: "Faculty not found" });

  const reportDir = ensureReportsDir();
  const fileName = `${Date.now()}-faculty-cv-${String(user._id)}.pdf`;
  const fullPath = path.join(reportDir, fileName);

  const score = calculateResearchScore({ publications, patents, projects, grants, events });

  const doc = new PDFDocument({ margin: 45, size: "A4" });
  doc.pipe(fs.createWriteStream(fullPath));

  doc.fontSize(18).text(`${user.name} - Research CV`, { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Email: ${user.email}`);
  doc.text(`Department: ${user.department?.name || "N/A"}`);
  doc.text(`Designation: ${user.designation || "N/A"}`);
  doc.text(`Qualification: ${profile?.qualification || "N/A"}`);
  doc.text(`Research Score: ${score}`);
  doc.moveDown();

  const writeSection = (title, lines = []) => {
    doc.fontSize(13).text(title, { underline: true });
    doc.moveDown(0.3);
    if (!lines.length) {
      doc.fontSize(10).text("No records available");
    } else {
      lines.forEach((line, idx) => doc.fontSize(10).text(`${idx + 1}. ${line}`));
    }
    doc.moveDown();
  };

  writeSection(
    "Publications",
    publications.map((p) => `${p.title} (${p.publicationYear}) - ${p.journalOrConferenceName || ""}`)
  );

  writeSection(
    "Projects",
    projects.map((p) => `${p.projectTitle} | ${p.fundingAgency} | ${p.status}`)
  );

  writeSection(
    "Patents",
    patents.map((p) => `${p.patentTitle} | ${p.status} | ${p.applicationNumber}`)
  );

  writeSection(
    "Grants",
    grants.map((g) => `${g.grantProposal} | Approved: ${g.amountApproved || 0}`)
  );

  writeSection(
    "Conferences / Events",
    events.map((e) => `${e.eventName} | ${e.eventType} | ${new Date(e.date).getFullYear()}`)
  );

  doc.end();

  const filePath = `/uploads/reports/${fileName}`;
  res.json({ success: true, data: { filePath } });
});

const chatAssistant = catchAsync(async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ success: false, message: "Question is required" });

  const answer = await buildAssistantResponse({ question, role: req.user.role });
  res.json({ success: true, data: { answer } });
});

const scorePrediction = catchAsync(async (req, res) => {
  const facultyId = req.body.facultyId || req.user._id;
  if (req.user.role === "faculty" && String(facultyId) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: "Faculty can predict only their own score" });
  }

  const [publications, patents, projects, grants, events] = await Promise.all([
    Publication.find({ submittedBy: facultyId, approvalStatus: "approved" }),
    Patent.find({ submittedBy: facultyId, approvalStatus: "approved" }),
    ResearchProject.find({ submittedBy: facultyId, approvalStatus: "approved" }),
    Grant.find({ submittedBy: facultyId, approvalStatus: "approved" }),
    Event.find({ submittedBy: facultyId, approvalStatus: "approved" }),
  ]);

  const currentScore = calculateResearchScore({ publications, patents, projects, grants, events });
  const facultyPrediction = predictScore({ currentScore, publications, patents, projects, grants });

  const facultyUsers = await User.find({ role: "faculty", isActive: true }).select("_id").lean();
  const departmentForecastMap = {};

  for (const faculty of facultyUsers) {
    const [fp, fpat, fpr, fg, fe] = await Promise.all([
      Publication.find({ submittedBy: faculty._id, approvalStatus: "approved" }),
      Patent.find({ submittedBy: faculty._id, approvalStatus: "approved" }),
      ResearchProject.find({ submittedBy: faculty._id, approvalStatus: "approved" }),
      Grant.find({ submittedBy: faculty._id, approvalStatus: "approved" }),
      Event.find({ submittedBy: faculty._id, approvalStatus: "approved" }),
    ]);
    const user = await User.findById(faculty._id).populate("department", "name").lean();
    const deptName = user?.department?.name || "N/A";
    const score = calculateResearchScore({ publications: fp, patents: fpat, projects: fpr, grants: fg, events: fe });
    const predicted = predictScore({ currentScore: score, publications: fp, patents: fpat, projects: fpr, grants: fg });

    if (!departmentForecastMap[deptName]) {
      departmentForecastMap[deptName] = { department: deptName, currentAggregateScore: 0, predictedNextYearAggregateScore: 0 };
    }

    departmentForecastMap[deptName].currentAggregateScore += score;
    departmentForecastMap[deptName].predictedNextYearAggregateScore += predicted.predictedNextYearScore;
  }

  res.json({
    success: true,
    data: {
      facultyPrediction,
      departmentForecast: Object.values(departmentForecastMap).sort(
        (a, b) => b.predictedNextYearAggregateScore - a.predictedNextYearAggregateScore
      ),
    },
  });
});

const ocrExtract = catchAsync(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "Document/image file is required" });

  const ext = path.extname(req.file.originalname || "").toLowerCase();
  let text = "";

  if (ext === ".pdf") {
    text = await extractTextFromPdf(req.file.path);
  } else {
    text = await extractTextWithOcr(req.file.path);
  }

  const keywords = frequencyKeywords(text, 20);

  res.json({
    success: true,
    data: {
      fileUrl: `/uploads/${req.file.filename}`,
      extractedText: text.slice(0, 15000),
      keywords,
      autoFill: {
        titleHint: firstLine(text),
        referenceNumberHint: findReferenceNumber(text),
        dateHint: findDate(text),
      },
    },
  });
});

function firstLine(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 5) || "";
}

function findReferenceNumber(text) {
  const match = String(text || "").match(/(application|ref|reference|letter)\s*(no\.?|number)?\s*[:\-]?\s*([A-Z0-9\/-]{5,})/i);
  return match?.[3] || "";
}

function findDate(text) {
  const match = String(text || "").match(/\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2})\b/);
  return match?.[1] || "";
}

module.exports = {
  generatePaperSummary,
  recommendationForFaculty,
  trendAnalysis,
  citationInsights,
  smartSearch,
  uploadPlagiarism,
  listPlagiarismReports,
  proposalAssistant,
  generateFacultyCv,
  chatAssistant,
  scorePrediction,
  ocrExtract,
  syncSemanticIndex,
};
