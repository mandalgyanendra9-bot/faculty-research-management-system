const express = require("express");
const { body } = require("express-validator");
const { register, login, forgotPassword, resetPassword, me } = require("../controllers/authController");
const validateRequest = require("../middlewares/validateRequest");
const { protect, optionalProtect } = require("../middlewares/auth");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("role").optional().isIn(["super_admin", "admin", "hod_dean", "faculty", "research_coordinator"]),
    body("isActive").optional().isBoolean(),
  ],
  optionalProtect,
  validateRequest,
  register
);
router.post("/login", [body("email").isEmail(), body("password").notEmpty()], validateRequest, login);
router.post("/forgot-password", [body("email").isEmail()], validateRequest, forgotPassword);
router.post(
  "/reset-password",
  [body("token").notEmpty(), body("newPassword").isLength({ min: 6 })],
  validateRequest,
  resetPassword
);
router.get("/me", protect, me);

module.exports = router;
