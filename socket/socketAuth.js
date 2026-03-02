const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = (socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) return next(new Error("Authentication error: token missing"));

  try {
    const decoded = jwt.verify(token, config.jwtSecret.jwtSecret);
    socket.userId = decoded._id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
};