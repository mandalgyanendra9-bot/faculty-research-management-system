const express = require("express");
const {
  listUsers,
  updateUser,
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

router.use(protect);

router.get("/", authorize("super_admin", "admin", "hod_dean"), listUsers);
router.put("/:id", authorize("super_admin", "admin"), updateUser);
router.patch("/:id/toggle-status", authorize("super_admin", "admin"), toggleUserStatus);

router.post("/departments", authorize("super_admin", "admin"), createDepartment);
router.put("/departments/:id", authorize("super_admin", "admin"), updateDepartment);
router.delete("/departments/:id", authorize("super_admin"), removeDepartment);

router.get("/lookups", listLookups);
router.post("/lookups", authorize("super_admin", "admin"), createLookup);
router.put("/lookups/:id", authorize("super_admin", "admin"), updateLookup);
router.delete("/lookups/:id", authorize("super_admin"), deleteLookup);

module.exports = router;
