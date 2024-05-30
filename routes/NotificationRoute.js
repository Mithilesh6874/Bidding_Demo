const express = require("express");
const {
  getNotifications,
  markNotificationsRead,
} = require("../controllers/NotificationController");
const verify = require("../authentication/auth");
const router = express.Router();

router.get("/", verify, getNotifications);
router.post("/mark", verify, markNotificationsRead);

module.exports = router;
