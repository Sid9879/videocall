const jwt = require("jsonwebtoken");
const config = require("../config");

const User = require("../models/User");
const Chat = require("../models/Chat");
const Gift = require("../models/Gift");
const Wallet = require("../models/Wallet");
const Purchase = require("../models/Purchase");





// async function updateUserStatus(userId, status) {
//   try {
//     await User.findByIdAndUpdate(userId, { status });
//   } catch (err) {
//     console.error(`Error updating status for user ${userId}:`, err);
//   }
// }


async function handleChatMessage(socket, data, io) {
  try {
    const chatMessage = await Chat.create({
      sender: socket.userId,
      receiver: data.receiverId,
      message: data.message,
      messageType: "text",
    });

    io.to(data.receiverId.toString()).emit("chatMessage", chatMessage);
    io.to(socket.userId.toString()).emit("chatMessage", chatMessage);

  } catch (err) {
    console.error("Error handling chat message:", err);
  }
}


async function handleSendGift(socket, data, io) {
  try {
    const { receiverId, giftId } = data;
    const senderId = socket.userId;

    const [gift, sender, receiver] = await Promise.all([
      Gift.findById(giftId),
      User.findById(senderId),
      User.findById(receiverId),
    ]);

    if (!gift) {
      return socket.emit("errorMessage", "Gift not found");
    }

    if (!sender || !receiver) {
      return socket.emit("errorMessage", "User not found");
    }

    if (sender.goldCoin < gift.cost) {
      return socket.emit("errorMessage", "Insufficient gold balance");
    }


    const updatedSender = await User.findOneAndUpdate(
      { _id: senderId, goldCoin: { $gte: gift.cost } },
      { $inc: { goldCoin: -gift.cost } },
      { new: true }
    );

    if (!updatedSender) {
      return socket.emit(
        "errorMessage",
        "Insufficient balance"
      );
    }

    await User.findByIdAndUpdate(
      receiverId,
      { $inc: { diamondWallet: config.giftChangeToDiamond } }
    );


    const [walletDebit, walletCredit, giftChat, purchase] =
      await Promise.all([

        Wallet.create({
          user: senderId,
          paidBy: senderId,
          type: "debit",
          status: "success",
          source: "gift_sent",
          goldCoins: gift.cost,
          message: `Sent gift: ${gift.name}`,
        }),

        Wallet.create({
          user: receiverId,
          paidBy: senderId,
          type: "credit",
          status: "success",
          source: "gift_received",
          diamond: config.giftChangeToDiamond,
          message: `Received gift: ${gift.name}`,
        }),

        Chat.create({
          sender: senderId,
          receiver: receiverId,
          messageType: "gift",
          gift: {
            giftId: gift._id,
            name: gift.name,
            icon: gift.icon,
            cost: gift.cost,
            rarity: gift.rarity,
          },
        }),

        Purchase.create({
          userId: senderId,
          paidAmount: gift.cost,
          status: "success",
          purchaseType: "GIFT",
          itemId: gift._id,
          itemModel: "Gift",
          remark: "Gift sent in chat",
        }),
      ]);

    io.to(receiverId.toString()).emit("chatMessage", giftChat);
    io.to(senderId.toString()).emit("chatMessage", giftChat);

  } catch (error) {
    console.error("Gift error:", error);
    socket.emit("errorMessage", "Gift sending failed");
  }
}


function handleDisconnect(socket) {
  console.log(`User disconnected: ${socket.userId}`);
  // updateUserStatus(socket.userId, "offline");
}


module.exports = function (io, socket) {

  console.log(`Chat module active for: ${socket.userId}`);

  // updateUserStatus(socket.userId, "online");

  socket.on("chatMessage", (data) => {
    handleChatMessage(socket, data, io);
  });

  socket.on("sendGift", (data) => {
    handleSendGift(socket, data, io);
  });

  socket.on("disconnect", () => {
    handleDisconnect(socket);
  });

};

// module.exports = function (io) {
//   // io.use(authenticateSocket);

//   io.on("connection", (socket) => {
//     console.log(`User connected: ${socket.userId}`);

//     updateUserStatus(socket.userId, "online");

//     socket.join(socket.userId.toString());

//     socket.on("chatMessage", (data) => {
//       handleChatMessage(socket, data, io);
//     });

//     socket.on("sendGift", (data) => {
//       handleSendGift(socket, data, io);
//     });

//     socket.on("disconnect", () => {
//       handleDisconnect(socket);
//     });
//   });
// };