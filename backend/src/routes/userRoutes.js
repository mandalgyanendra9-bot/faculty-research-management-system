const express = require("express");
const {
  listUsers,
  updateUser,
  listPendingUsers,
  approvePendingFaculty,
  assignUserRole,
  toggleUserStatus,
  createDepartment,
  listDepartments,
  updateDepartment,
  removeDepartment,
  createLookup,
  listLookups,
  updateLookup,
  deleteLookup,
} = require("../controllers/userController");
const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

router.get("/departments/list", listDepartments);
router.get("/lookups", listLookups);

router.use(protect);

router.get("/", authorize("super_admin", "admin", "hod_dean"), listUsers);
router.put("/:id", authorize("super_admin", "admin"), updateUser);
router.get("/pending-approvals", authorize("super_admin", "admin"), listPendingUsers);
router.patch("/:id/approve-faculty", authorize("super_admin", "admin"), approvePendingFaculty);
router.patch("/:id/assign-role", authorize("super_admin", "admin"), assignUserRole);
router.patch("/:id/toggle-status", authorize("super_admin", "admin"), toggleUserStatus);

router.post("/departments", authorize("super_admin", "admin"), createDepartment);
router.put("/departments/:id", authorize("super_admin", "admin"), updateDepartment);
router.delete("/departments/:id", authorize("super_admin"), removeDepartment);

router.post("/lookups", authorize("super_admin", "admin"), createLookup);
router.put("/lookups/:id", authorize("super_admin", "admin"), updateLookup);
router.delete("/lookups/:id", authorize("super_admin"), deleteLookup);

module.exports = router;
