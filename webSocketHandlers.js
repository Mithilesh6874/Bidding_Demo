const db = require("./config/db");
const WebSocket = require("ws");

const userConnections = new Map();

const notifyUser = (userId, notification) => {
  const userWs = userConnections.get(userId);
  if (userWs && userWs.readyState === WebSocket.OPEN) {
    userWs.send(JSON.stringify({ type: "notify", payload: notification }));
  }
};

const handleNewBid = (wss, payload) => {
  if (!wss || !wss.clients) {
    console.error("WebSocket server or clients not initialized");
    return;
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "update", payload }));
    }
  });

  const { item_id, user_id, bid_amount } = payload;
  db.query(
    "SELECT user_id FROM items WHERE id = ?",
    [item_id],
    (err, results) => {
      if (results.length > 0) {
        const itemOwner = results[0].user_id;
        notifyUser(itemOwner, {
          message: `Your item received a new bid of ${bid_amount}`,
        });
      }
    }
  );
};

const setupWebSocketHandlers = (wss) => {
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
              handleNewBid(wss, data.payload);
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
};

const handleNotification = (payload) => {
  // Handle notification if needed
};

module.exports = {
  setupWebSocketHandlers,
  handleNewBid,
  notifyUser,
  userConnections,
};
