const jwt = require("jsonwebtoken");
const config = require("../config");

const Battle = require("../models/Battle");
const BattleComment = require("../models/BattleComment");
const Vote = require("../models/Vote");
const Gift = require("../models/Gift");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Purchase = require("../models/Purchase");
const Follow = require("../models/Follow");
const NotificationRecipient = require("../models/NotificationRecipient");
const LiveHistoryRecord = require("../models/LiveHistoryRecord");
const HostLeaderboard = require('../models/HostLeaderboard')

const generateZegoToken = require("../utility/generateZegoToken");

const activeBattles = new Map();
const battleIntervals = new Map();
const reconnectTimeouts = new Map();

const onlineHosts = new Set(); // Tracks UserIDs of verified hosts currently online
const activeRandomInvites = new Set(); // Tracks HostA IDs who have an active random broadcast


async function notifyFollowers(userId, title, message, io) {
  try {
    // 1. Get followers (people who follow this user)
    const followers = await Follow.find({ following: userId })
      .select("follower")
      .lean();

    // 2. Get following (people this user follows)
    const following = await Follow.find({ follower: userId })
      .select("following")
      .lean();

    // 3. Combine into a unique set of IDs
    const recipientIds = new Set([
      ...followers.map(f => f.follower.toString()),
      ...following.map(f => f.following.toString())
    ]);

    // Remove self from recipients if present
    recipientIds.delete(userId.toString());

    if (recipientIds.size === 0) return;

    const finalIds = Array.from(recipientIds);

    await NotificationRecipient.insertMany(
      finalIds.map(id => ({
        user: id,
        title,
        message,
        type: "info"
      }))
    );

    io.to(finalIds).emit("newNotification", { title, message });

  } catch (err) {
    console.error("Notification error:", err);
  }
}

module.exports = function (io, socket) {

  console.log(`video active for: ${socket.userId}`);
  
  // Track host availability for random invites
  User.findById(socket.userId).then(user => {
    if (user && user.role === "host" && user.hostVerification?.isVerified) {
      onlineHosts.add(socket.userId.toString());
    }
  });

  socket.join(socket.userId.toString());

  
  socket.on("inviteRandomHost", async ({ duration = 300 }) => {
    try {
      const user = await User.findById(socket.userId);
      if (!user || user.role !== "host" || !user.hostVerification?.isVerified) {
        return socket.emit("errorMessage", "Only verified hosts can invite others");
      }

      const availableHosts = Array.from(onlineHosts).filter(id => id !== socket.userId.toString());

      if (availableHosts.length === 0) {
        return socket.emit("errorMessage", "No hosts are currently online for a random battle");
      }

   
      const invitePayload = {
        hostA: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar
        },
        duration,
        type: "random_invite"
      };

      availableHosts.forEach(hostId => {
        io.to(hostId).emit("randomBattleRequest", invitePayload);
      });

      activeRandomInvites.add(socket.userId.toString());

      socket.emit("successMessage", "Random invitation sent to online hosts");
    } catch (err) {
      console.error("inviteRandomHost error:", err);
    }
  });

  socket.on("acceptRandomInvite", async ({ hostAId, duration = 300 }) => {
    try {
      const userB = await User.findById(socket.userId);
      if (!userB || userB.role !== "host" || !userB.hostVerification?.isVerified) {
        return socket.emit("errorMessage", "Only verified hosts can accept battles");
      }

      const userA = await User.findById(hostAId);
      if (!userA) return socket.emit("errorMessage", "Original host is no longer available");

      if (!activeRandomInvites.delete(hostAId.toString())) {
        return socket.emit("errorMessage", "This invite has already been accepted or is no longer valid");
      }

      const battle = await Battle.create({
        hostA: hostAId,
        hostB: socket.userId,
        duration,
        status: "pending"
      });

      const roomID = battle._id.toString();
      socket.join(roomID);
      
      const battleData = battle.toObject();
      battleData.hostA = { _id: userA._id, name: userA.name, avatar: userA.avatar };
      battleData.hostB = { _id: userB._id, name: userB.name, avatar: userB.avatar };

      io.to(hostAId.toString()).emit("randomInviteAccepted", battleData);
      
      io.to(roomID).emit("battleReady", { battleId: battle._id });

    } catch (err) {
      console.error("acceptRandomInvite error:", err);
      socket.emit("errorMessage", "Failed to accept random invite");
    }
  });

// ---------
  socket.on("goLive", async () => {
    try {
      const user = await User.findById(socket.userId);
      if (!user || user.role !== "host" || !user.hostVerification?.isVerified) {
        return socket.emit("errorMessage", "Only verified hosts can go live");
      }

      const battle = await Battle.create({
        hostA: socket.userId,
        hostB: null,
        status: "live",
        isGolive: true,
        startTime: new Date()
      });

      const roomID = battle._id.toString();
      socket.join(roomID);

      const hostToken = await generateZegoToken({
        userID: socket.userId.toString(),
        roomID,
        publish: true,
        login: true
      });

      socket.emit("liveStarted", {
        battleId: battle._id,
        roomID,
        hostName: user.name,
        hostAvatar: user.avatar,
        ...hostToken
      });

      await LiveHistoryRecord.create({
        battleId: battle._id,
        hostA: socket.userId
      });

      await notifyFollowers(
        socket.userId,
        "I'm Live! 🎥",
        "Come join my live stream and chat!",
        io
      );
    } catch (err) {
      console.error("goLive error:", err);
      socket.emit("errorMessage", `Go Live Failed: ${err.message}`);
    }
  });

  socket.on("createBattle", async ({ opponentId, duration = 300 }) => {
    try {
      const user = await User.findById(socket.userId);
      if (!user || user.role !== "host" || !user.hostVerification?.isVerified) {
        return socket.emit("errorMessage", "Only verified hosts can start a battle");
      }

      if (!opponentId)
        return socket.emit("errorMessage", "Opponent required");

      const battle = await Battle.create({
        hostA: socket.userId,
        hostB: opponentId,
        duration,
        status: "pending"
      });

      socket.join(battle._id.toString());

      const battleData = battle.toObject();
      battleData.hostA = {
        _id: user._id,
        name: user.name,
        avatar: user.avatar
      };

      io.to(opponentId.toString()).emit("battleRequest", battleData);

      await notifyFollowers(
        socket.userId,
        "Battle Started 🔥",
        "Your favorite influencer just started a battle!",
        io
      );
    } catch (err) {
      console.error("createBattle error:", err);
      socket.emit("errorMessage", `Create Battle Failed: ${err.message}`);
    }
  });


  socket.on("startBattle", async ({ battleId }) => {
    try {
      const battle = await Battle.findById(battleId)
        .populate("hostA", "name avatar")
        .populate("hostB", "name avatar");

      if (!battle)
        return socket.emit("errorMessage", "Battle not found");

      if (![battle.hostA._id.toString(), battle.hostB._id.toString()]
        .includes(socket.userId.toString()))
        return socket.emit("errorMessage", "Not authorized");

      if (battle.status !== "pending")
        return socket.emit("errorMessage", "Already started");

      battle.status = "live";
      battle.startTime = new Date();
      battle.endTime = new Date(Date.now() + battle.duration * 1000);
      await battle.save();

      activeBattles.set(battleId, {
        hostA: battle.hostA._id.toString(),
        hostB: battle.hostB._id.toString()
      });

      io.to(battleId).emit("battleStarted", battle);

      await LiveHistoryRecord.create({
        battleId: battle._id,
        hostA: battle.hostA,
        hostB: battle.hostB
      });

      const roomID = battleId.toString();

      const [hostAToken, hostBToken] = await Promise.all([
        generateZegoToken({ userID: battle.hostA._id.toString(), roomID, publish: true, login: true }),
        generateZegoToken({ userID: battle.hostB._id.toString(), roomID, publish: true, login: true })
      ]);

      io.to(battle.hostA._id.toString()).emit("zegoToken", { roomID, ...hostAToken });
      io.to(battle.hostB._id.toString()).emit("zegoToken", { roomID, ...hostBToken });

      await Promise.all([
        notifyFollowers(battle.hostA, "Battle Live 🚀", "Influencer is live!", io),
        notifyFollowers(battle.hostB, "Battle Live 🚀", "Influencer is live!", io)
      ]);

      setTimeout(() =>
        forceEndBattle(battleId, io, "time_up"),
        battle.duration * 1000
      );

      const intervalId = setInterval(async () => {
        try {
          const currentBattle = await Battle.findById(battleId);
          if (!currentBattle || currentBattle.status !== "live") {
            clearInterval(battleIntervals.get(battleId));
            battleIntervals.delete(battleId);
            return;
          }

          const timeOffset = Math.floor((Date.now() - currentBattle.startTime) / 1000);
          const snapshot = {
            time: timeOffset,
            hostAScore: currentBattle.hostAScore,
            hostBScore: currentBattle.hostBScore
          };

          await Battle.findByIdAndUpdate(battleId, {
            $push: { scoreHistory: snapshot }
          });

          io.to(battleId).emit("scoreHistoryUpdate", snapshot);
        } catch (err) {
          console.error("Snapshot error:", err);
        }
      }, 10000);

      battleIntervals.set(battleId, intervalId);
    } catch (err) {
      console.error("startBattle error:", err);
      socket.emit("errorMessage", "Internal server error while starting battle");
    }
  });


  socket.on("joinBattle", async ({ battleId }) => {
    try {
      if (socket.rooms.has(battleId.toString())) return;

      socket.join(battleId);
      const user = await User.findById(socket.userId);
      if (user.isBlocked) {
        return socket.emit("errorMessage", "You are blocked from joining this battle by the admin.");
      }

      const timeoutKey = `${battleId}_${socket.userId}`;
      if (reconnectTimeouts.has(timeoutKey)) {
        clearTimeout(reconnectTimeouts.get(timeoutKey));
        reconnectTimeouts.delete(timeoutKey);
        io.to(battleId).emit("hostStatusUpdate", { hostId: socket.userId, status: "connected" });
      }

      const isAlreadyJoined = await LiveHistoryRecord.findOne({
        battleId,
        "participatedUsers.userId": socket.userId
      });

      let battle;
      if (!isAlreadyJoined) {
        battle = await Battle.findOneAndUpdate(
          { _id: battleId, status: "live" },
          { $inc: { viewCount: 1 } },
          { new: true }
        );

        await LiveHistoryRecord.findOneAndUpdate(
          { battleId },
          {
            $addToSet: { participatedUsers: { userId: socket.userId, joinedAt: new Date() } }
          }
        );
      } else {
        battle = await Battle.findOne({ _id: battleId, status: "live" });
      }

      if (!battle)
        return socket.emit("errorMessage", "Live session not found or ended");

      io.to(battleId).emit("viewUpdate", battle.viewCount);

      const viewerToken = await generateZegoToken({
        userID: socket.userId.toString(),
        roomID: battleId,
        publish: false,
        login: true
      });

      socket.emit("zegoToken", { roomID: battleId, ...viewerToken });
      socket.emit("battleHistory", battle.scoreHistory);
    } catch (err) {
      console.error("joinBattle error:", err);
      socket.emit("errorMessage", "Internal server error while joining battle");
    }
  });


  socket.on("battleComment", async ({ battleId, message }) => {
    try {
      if (!message) return;

      const [battle, user] = await Promise.all([
        Battle.findOne({ _id: battleId, status: "live" }),
        User.findById(socket.userId).select("name avatar")
      ]);

      if (!battle || !user) return;

      await Promise.all([
        BattleComment.create({ battleId, userId: socket.userId, message }),
        Battle.findByIdAndUpdate(battleId, { $inc: { commentCount: 1 } })
      ]);

      io.to(battleId).emit("commentUpdate", {
        message,
        userId: socket.userId,
        userName: user.name,
        userAvatar: user.avatar
      });
    } catch (err) {
      console.error("battleComment error:", err);
    }
  });


  socket.on("battleGift", async ({ battleId, giftId, hostId }) => {
    try {
      const senderId = socket.userId;

      const [gift, battle] = await Promise.all([
        Gift.findById(giftId),
        Battle.findOne({ _id: battleId, status: "live" })
      ]);

      if (!gift || !battle) return;

      const isHostA = hostId === battle.hostA.toString();
      const isHostB = battle.hostB && hostId === battle.hostB.toString();

      if (!isHostA && !isHostB) return;

      const updatedSender = await User.findOneAndUpdate(
        { _id: senderId, goldCoin: { $gte: gift.cost } },
        { $inc: { goldCoin: -gift.cost } },
        { new: true }
      );

      if (!updatedSender)
        return socket.emit("errorMessage", "Insufficient balance");

      const scoreField = isHostA ? "hostAScore" : "hostBScore";

      await Promise.all([
        User.findByIdAndUpdate(hostId,{$inc: {diamondWallet: gift.cost,giftReceivedCount: 1,giftReceivedValue: gift.cost}}),
        Battle.findByIdAndUpdate(battleId, { $inc: { [scoreField]: gift.cost } }),
        HostLeaderboard.findOneAndUpdate(
          { hostId },
          {
            $inc: {
              receivedCoinValue: gift.cost,
              receivedCoinCount: 1
            }
          },
          { upsert: true, new: true }
        ),

        Wallet.create({
          user: senderId,
          paidBy: senderId,
          type: "debit",
          status: "success",
          source: "battle_gift_sent",
          goldCoins: gift.cost,
          message: `Sent battle gift: ${gift.name}`
        }),

        Wallet.create({
          user: hostId,
          paidBy: senderId,
          type: "credit",
          status: "success",
          source: "battle_gift_received",
          diamond: gift.cost,
          message: `Received battle gift: ${gift.name}`
        }),

        Purchase.create({
          userId: senderId,
          paidAmount: gift.cost,
          status: "success",
          purchaseType: "BATTLE_GIFT",
          itemId: gift._id,
          itemModel: "Gift",
          remark: "Battle gift sent"
        }),

        LiveHistoryRecord.findOneAndUpdate(
          { battleId },
          { $inc: { [isHostA ? "hostAGifts" : "hostBGifts"]: gift.cost } }
        )
      ]);

      io.to(battleId).emit("scoreUpdate", {
        scoreField,
        amount: gift.cost
      });
    } catch (err) {
      console.error("battleGift error:", err);
      socket.emit("errorMessage", "Internal server error while sending gift");
    }
  });


  socket.on("voteHost", async ({ battleId, hostId }) => {
    try {
      const battle = await Battle.findOne({ _id: battleId, status: "live" });
      if (!battle) return;

      try {
        await Vote.create({
          battleId,
          voterId: socket.userId,
          votedFor: hostId
        });
      } catch (err) {
        if (err.code === 11000) {
          return socket.emit("errorMessage", "You have already voted in this battle");
        }
        console.error("Vote error:", err);
        return;
      }

      const voteField =
        hostId === battle.hostA.toString()
          ? "hostAVotes"
          : "hostBVotes";

      if (voteField === "hostBVotes" && !battle.hostB) return;

      const updated = await Battle.findByIdAndUpdate(
        battleId,
        { $inc: { [voteField]: 1 } },
        { new: true }
      );

      io.to(battleId).emit("voteUpdate", {
        hostAVotes: updated.hostAVotes,
        hostBVotes: updated.hostBVotes
      });
    } catch (err) {
      console.error("voteHost error:", err);
    }
  });


  socket.on("endBattle", async ({ battleId, duration }) => {
    try {
      const battle = await Battle.findById(battleId);
      if (!battle) return socket.emit("errorMessage", "Battle not found");

      // Only hosts can end the battle manually
      if (![battle.hostA.toString(), battle.hostB?.toString()].includes(socket.userId.toString())) {
        return socket.emit("errorMessage", "Not authorized to end this battle");
      }

      await forceEndBattle(battleId, io, "manual_end", duration);
    } catch (err) {
      console.error("endBattle error:", err);
      socket.emit("errorMessage", "Failed to end battle");
    }
  });


  socket.on("disconnect", async () => {
    try {
      // Remove from online hosts map
      onlineHosts.delete(socket.userId.toString());
      activeRandomInvites.delete(socket.userId.toString());

      for (const [battleId, hosts] of activeBattles.entries()) {
        const isHostA = hosts.hostA === socket.userId.toString();
        const isHostB = hosts.hostB && hosts.hostB === socket.userId.toString();

        if (isHostA || isHostB) {
          const timeoutKey = `${battleId}_${socket.userId}`;

          io.to(battleId).emit("hostStatusUpdate", { hostId: socket.userId, status: "disconnected" });

          const timeoutId = setTimeout(async () => {
            try {
              await forceEndBattle(battleId, io, "host_left");
            } catch (endErr) {
              console.error("Error ending battle after timeout:", endErr);
            }
            reconnectTimeouts.delete(timeoutKey);
          }, 30000);

          reconnectTimeouts.set(timeoutKey, timeoutId);
        }
      }
      console.log("Disconnected:", socket.userId);
    } catch (err) {
      console.error("disconnect error:", err);
    }
  });

};


async function forceEndBattle(battleId, io, reason, manualDuration) {

  const battle = await Battle.findById(battleId);
  if (!battle || battle.status === "ended") return;

  battle.status = "ended";
  battle.endTime = new Date();

  if (manualDuration !== undefined) {
    battle.liveDuration = manualDuration;
  } else if (battle.startTime) {
    const durationInSeconds = Math.floor((battle.endTime - battle.startTime) / 1000);
    battle.liveDuration = durationInSeconds;
  }

  let winner = null;
  if (battle.hostAScore > battle.hostBScore)
    winner = battle.hostA;
  else if (battle.hostBScore > battle.hostAScore)
    winner = battle.hostB;

  battle.winner = winner;
  await battle.save();

  io.to(battleId).emit("battleEnded", {
    reason,
    hostAScore: battle.hostAScore,
    hostBScore: battle.hostBScore,
    hostAVotes: battle.hostAVotes,
    hostBVotes: battle.hostBVotes,
    winner
  });

  const sockets = await io.in(battleId).fetchSockets();
  sockets.forEach(s => s.leave(battleId));

  activeBattles.delete(battleId);

  const intervalId = battleIntervals.get(battleId);
  if (intervalId) {
    clearInterval(intervalId);
    battleIntervals.delete(battleId);
  }

  for (const [key, timeoutId] of reconnectTimeouts.entries()) {
    if (key.startsWith(`${battleId}_`)) {
      clearTimeout(timeoutId);
      reconnectTimeouts.delete(key);
    }
  }
}