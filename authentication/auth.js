const jwt = require("jsonwebtoken");
const JWT_SECRET = "gojo_satoru";

function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  console.log("token", token);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  const tokenWithoutPrefix = token.replace("Bearer ", "");
  jwt.verify(tokenWithoutPrefix, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Error verifying token:", err);
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    console.log("Decoded token payload:", decoded);
    req.userId = decoded.userId;
    next();
  });
}

module.exports = verifyToken;
