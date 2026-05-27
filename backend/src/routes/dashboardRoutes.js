const express = require("express");
const { overview, facultyRanking } = require("../controllers/dashboardController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();
router.use(protect);
router.get("/overview", authorize("super_admin", "admin", "hod_dean", "research_coordinator", "faculty"), overview);
router.get("/faculty-ranking", authorize("super_admin", "admin", "hod_dean", "research_coordinator"), facultyRanking);

module.exports = router;
