const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const userRoute = require("./routes/UserRoute");
const bidsRoute = require("./routes/BidsRoute");
const notificationsRoute = require("./routes/NotificationRoute");
const itemsRoute = require("./routes/ItemsRoute");
const db = require("./config/db");
const { handleNewBid, notifyUser } = require("./webSocketHandlers");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 8000;

const wss = new WebSocket.Server({ port: 8080 });

const userConnections = new Map();

wss.on("connection", (ws, req) => {
  const token = req.url.split("token=")[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, "gojo_satoru");
      userConnections.set(decoded.userId, ws);
      ws.on("close", () => {
        userConnections.delete(decoded.userId);
      });
      ws.on("message", (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
          case "bid":
            handleNewBid(data.payload, userConnections);
            break;
          case "notify":
            handleNotification(data.payload);
            break;
          default:
            console.log("Unknown message type:", data.type);
        }
      });
    } catch (err) {
      ws.close();
    }
  } else {
    ws.close();
  }
});

const handleNotification = (payload) => {
  // Handle notification if needed
};

app.use("/api/users", userRoute);
app.use("/api/bids", bidsRoute);
app.use("/api/notifications", notificationsRoute);
app.use("/api/items", itemsRoute);

app.listen(port, () => {
  console.log("Listening on port " + port);
});

module.exports = app;
