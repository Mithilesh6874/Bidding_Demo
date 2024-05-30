const express = require("express");
const { createBid, getBids } = require("../controllers/BidsController");
const verify = require("../authentication/auth");
const router = express.Router();

router.post("/", verify, createBid);
router.get("/:id", verify, getBids);

module.exports = router;
