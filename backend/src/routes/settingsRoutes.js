const express = require("express");
const { protect, authorize } = require("../middlewares/auth");
const { getAIProviderSettings, updateAIProviderSettings } = require("../controllers/settingsController");

const router = express.Router();

router.use(protect);
router.get("/ai-provider", authorize("super_admin", "admin", "research_coordinator"), getAIProviderSettings);
router.put("/ai-provider", authorize("super_admin", "admin"), updateAIProviderSettings);

module.exports = router;
