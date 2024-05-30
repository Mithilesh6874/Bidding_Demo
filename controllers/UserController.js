const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = (req, res) => {
  const { username, password, email, role } = req.body;
  if (!username || !password || !email || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      db.query(
        "INSERT INTO users (username, password, email, role, created_at) VALUES (?, ?, ?, ?, ?)",
        [username, hashedPassword, email, role, currentDate],
        (err, results) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({
            message: "User registered successfully",
            userId: results.insertId,
          });
        }
      );
    });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    bcrypt.compare(password, results[0].password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const token = jwt.sign(
        {
          userId: results[0].id,
          email: results[0].email,
          role: results[0].role,
        },
        "gojo_satoru",
        { expiresIn: "1h" }
      );
      res.status(200).json({ message: "Login successful", token });
    });
  });
};

const getProfile = (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }
  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), "gojo_satoru"); // Ensure this secret key matches the one used in login
    db.query(
      "SELECT * FROM users WHERE id = ?",
      [decoded.userId],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }
        const userProfile = {
          username: results[0].username,
          email: results[0].email,
          role: results[0].role,
          created_at: results[0].created_at,
        };
        res.status(200).json(userProfile);
      }
    );
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { register, login, getProfile };
