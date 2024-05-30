const db = require("../config/db");
const { handleNewBid } = require("../webSocketHandlers");

const createBid = (req, res) => {
  const { item_id, user_id, bid_amount } = req.body;
  if (!item_id || !user_id || !bid_amount) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  db.query(
    "INSERT INTO bids (item_id, user_id, bid_amount, created_at) VALUES (?, ?, ?, ?)",
    [item_id, user_id, bid_amount, currentDate],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // Notify all connected clients about the new bid
      handleNewBid({ item_id, user_id, bid_amount, bidId: results.insertId });
      res.status(201).json({
        message: "Bid created successfully",
        bidId: results.insertId,
      });
    }
  );
};

// Retrieve all bids for a specific item
const getBids = (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM bids WHERE item_id = ?", id, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
};

module.exports = { createBid, getBids };
