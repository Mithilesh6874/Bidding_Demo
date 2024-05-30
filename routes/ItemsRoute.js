const express = require("express");
const {
  createItem,
  getItem,
  getItemById,
  updateItem,
  deleteItem,
} = require("../controllers/ItemsController");
const verify = require("../authentication/auth");
const multer = require("multer");

// Configure multer to store files with unique names
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.post("/", verify, upload.single("image"), createItem);
router.get("/", verify, getItem);
router.get("/:id", verify, getItemById);
router.put("/:id", verify, updateItem);
router.delete("/:id", verify, deleteItem);

module.exports = router;
