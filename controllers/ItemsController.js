const db = require("../config/db");
const jwt = require("jsonwebtoken");
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

const createItem = (req, res) => {
  const { name, description, starting_price, current_price, end_time } =
    req.body;

  if (!req.file) {
    return res.status(400).json({ error: "Image is required" });
  }

  const image_url = `/uploads/${req.file.filename}`;
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  db.query(
    "INSERT INTO items (name, description, starting_price, current_price, image_url, end_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      name,
      description,
      starting_price,
      current_price,
      image_url,
      end_time,
      currentDate,
    ],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: "Item created successfully",
        itemId: results.insertId,
      });
    }
  );
};

const getItem = (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  let query = "SELECT * FROM items WHERE 1=1";
  const queryParams = [];

  if (search) {
    query += " AND name LIKE ?";
    queryParams.push(`%${search}%`);
  }

  if (status) {
    query += " AND status = ?";
    queryParams.push(status);
  }

  const offset = (page - 1) * limit;
  query += " LIMIT ? OFFSET ?";
  queryParams.push(parseInt(limit), offset);

  db.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json(results);
  });
};

const getItemById = (req, res) => {
  const id = req.params.id;

  db.query("SELECT * FROM items WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json(results[0]);
  });
};

const updateItem = (req, res) => {
  const id = req.params.id;

  const { name, description, starting_price, current_price, image_url } =
    req.body;

  if (
    !name ||
    !description ||
    !starting_price ||
    !current_price ||
    !image_url
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.query(
    "UPDATE items SET name = ?, description = ?, starting_price = ?, current_price = ?, image_url = ? WHERE id = ?",
    [name, description, starting_price, current_price, image_url, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(200).json({ message: "Item updated successfully" });
    }
  );
};

const deleteItem = (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM items WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  });
};

module.exports = { createItem, getItem, getItemById, updateItem, deleteItem };
