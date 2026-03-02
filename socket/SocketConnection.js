// const socket = require("socket.io");
// const socketAuth = require("./socketAuth");
// const chatSocket = require("./ChatSocket");
// const battleSocket = require("./BattleSocket");

// const initializeSocket = (server) => {
//   const io = socket(server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST"],
//     },
//   });

//   io.use(socketAuth);

//   chatSocket(io);
//   battleSocket(io);

//   return io;
// };

// module.exports = initializeSocket;


const socket = require("socket.io");
const socketAuth = require("./socketAuth");
const chatSocket = require("./ChatSocket");
const battleSocket = require("./BattleSocket");
const User = require("../models/User");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(socketAuth);

  io.on("connection", async (socket) => {
    console.log("User connected:", socket.userId);

    try {
      await User.findByIdAndUpdate(socket.userId, { status: "online" });
      console.log(`User ${socket.userId} status updated to online`);
    } catch (error) {
      console.error(`Error updating status to online for user ${socket.userId}:`, error);
    }

    socket.join(socket.userId.toString());

    chatSocket(io, socket);
    battleSocket(io, socket);

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.userId);
      try {
        await User.findByIdAndUpdate(socket.userId, { status: "offline" });
        console.log(`User ${socket.userId} status updated to offline`);
      } catch (error) {
        console.error(`Error updating status to offline for user ${socket.userId}:`, error);
      }
    });
  });

  return io;
};

module.exports = initializeSocket;