const express = require("express");
const ResearchProject = require("../models/ResearchProject");
const { buildRecordController } = require("../controllers/recordControllerFactory");
const { protect, authorize } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();
const controller = buildRecordController({ model: ResearchProject, entityName: "project" });

router.use(protect);
router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", authorize("super_admin", "admin", "hod_dean", "faculty", "research_coordinator"), upload.single("document"), controller.create);
router.put("/:id", upload.single("document"), controller.update);
router.delete("/:id", controller.remove);
router.patch("/:id/approval", authorize("super_admin", "admin", "hod_dean"), controller.approveWorkflow);

module.exports = router;
