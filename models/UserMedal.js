const mongoose = require("mongoose");

const UserMedalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    medalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medal",
      required: true,
    },

    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserMedal", UserMedalSchema);
