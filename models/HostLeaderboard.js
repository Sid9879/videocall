const mongoose = require("mongoose");

const HostLeaderboardSchema = new mongoose.Schema(
  {
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    receivedCoinValue: {
      type: Number,
      default: 0,
      index: true
    },

    receivedCoinCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);
HostLeaderboardSchema.index({hostId:1});
module.exports = mongoose.model("HostLeaderboard", HostLeaderboardSchema);