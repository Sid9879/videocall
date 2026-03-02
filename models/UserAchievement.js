const mongoose = require("mongoose");

const UserAchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
    },

    progress: {
      type: Number,
      default: 0,
    },

    target: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },

    unlockedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserAchievement", UserAchievementSchema);
