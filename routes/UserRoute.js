const express = require("express");
const {
  register,
  login,
  getProfile,
} = require("../controllers/UserController");
const verify = require("../authentication/auth");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verify, getProfile);

module.exports = router;
