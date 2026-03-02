const mongoose = require("mongoose");

const AchievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: String,

    icon: {
      type: String,
      required: true,
    },

    category: {
      type: String, // social, game, wallet, streak
    },

    rarity: {
      type: String, // common, rare, epic, legendary
    },

    requirement: {
      type: {
        type: String, // followers, likes, posts, wins
        required: true,
      },
      count: {
        type: Number, // target value
        required: true,
      },
    },

    reward: {
      type: Number, // XP reward
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Achievement", AchievementSchema);
