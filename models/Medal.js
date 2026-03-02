const mongoose = require("mongoose");

const MedalSchema = new mongoose.Schema(
  {
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["bronze", "silver", "gold", "diamond"],
      required: true,
    },

    icon: {
      type: String, // medal icon url
      required: true,
    },

    requiredAchievements: {
      type: Number, // how many achievements needed
      required: true,
    },

    rewardXp: {
      type: Number,
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

module.exports = mongoose.model("Medal", MedalSchema);
