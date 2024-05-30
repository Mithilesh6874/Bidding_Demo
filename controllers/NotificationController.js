const db = require("../config/db");

const markNotificationsRead = (req, res) => {
  db.query(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
    [req.userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ message: "Notifications marked as read" });
    }
  );
};

const getNotifications = (req, res) => {
  db.query("SELECT * FROM notifications", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
};

module.exports = { markNotificationsRead, getNotifications };
