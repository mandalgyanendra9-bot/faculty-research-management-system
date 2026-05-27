const express = require("express");
const {
  upsertMyProfile,
  getMyProfile,
  getFacultyProfiles,
  getFacultyProfileById,
} = require("../controllers/facultyController");
const { protect, authorize } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();

router.use(protect);
router.get("/me", getMyProfile);
router.put("/me", upload.single("profilePhoto"), upsertMyProfile);
router.get("/", authorize("super_admin", "admin", "hod_dean", "research_coordinator"), getFacultyProfiles);
router.get("/:userId", authorize("super_admin", "admin", "hod_dean", "research_coordinator"), getFacultyProfileById);

module.exports = router;
