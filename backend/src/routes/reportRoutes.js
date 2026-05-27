const express = require("express");
const { generateReport, listReports } = require("../controllers/reportController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.use(protect);
router.get("/", authorize("super_admin", "admin", "hod_dean", "research_coordinator", "faculty"), listReports);
router.post("/generate", authorize("super_admin", "admin", "hod_dean", "research_coordinator", "faculty"), generateReport);

module.exports = router;
