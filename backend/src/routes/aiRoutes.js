const express = require("express");
const upload = require("../middlewares/upload");
const { protect, authorize } = require("../middlewares/auth");
const { createAuditLog } = require("../services/auditService");
const {
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
} = require("../controllers/aiController");

const router = express.Router();

router.use(protect);
router.use((req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      createAuditLog(req, {
        action: "ai_usage",
        module: "ai",
        targetType: "endpoint",
        status: "success",
        details: { method: req.method, path: req.originalUrl },
      });
    }
  });
  next();
});

router.post("/research-summary", upload.single("paper"), generatePaperSummary);
router.post("/publication-recommendation", recommendationForFaculty);
router.get("/trend-analysis", authorize("super_admin", "admin", "hod_dean", "research_coordinator"), trendAnalysis);
router.get("/citation-insights", authorize("super_admin", "admin", "hod_dean", "research_coordinator"), citationInsights);
router.post("/smart-search", smartSearch);
router.post("/plagiarism", upload.single("report"), uploadPlagiarism);
router.get("/plagiarism", authorize("super_admin", "admin", "hod_dean", "research_coordinator"), listPlagiarismReports);
router.post("/proposal-assistant", proposalAssistant);
router.get("/faculty-cv", generateFacultyCv);
router.get("/faculty-cv/:facultyId", authorize("super_admin", "admin", "hod_dean", "research_coordinator"), generateFacultyCv);
router.post("/chat", chatAssistant);
router.post("/score-prediction", scorePrediction);
router.post("/ocr", upload.single("document"), ocrExtract);
router.post("/semantic-index/sync", authorize("super_admin", "admin", "research_coordinator"), syncSemanticIndex);

module.exports = router;
