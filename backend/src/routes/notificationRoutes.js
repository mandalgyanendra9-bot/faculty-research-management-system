const express = require("express");
const { listMyNotifications, markAsRead, markAllRead } = require("../controllers/notificationController");
const { protect } = require("../middlewares/auth");

const router = express.Router();

router.use(protect);
router.get("/", listMyNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/mark-all-read", markAllRead);

module.exports = router;
