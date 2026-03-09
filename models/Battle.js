const mongoose = require("mongoose");

const BattleSchema = new mongoose.Schema({
  hostA: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hostB: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  status: {
    type: String,
    enum: ["pending", "live", "ended"],
    default: "pending"
  },
  isGolive: {
    type: Boolean,
    default: false
  },
  liveDuration: { type: Number, default: 0 }, // Duration in seconds
  duration: { type: Number, default: 120 },

  startTime: Date,
  endTime: Date,

  hostAScore: { type: Number, default: 0 },
  hostBScore: { type: Number, default: 0 },

  hostAVotes: { type: Number, default: 0 },
  hostBVotes: { type: Number, default: 0 },

  viewCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },

 scoreHistory: [
    {
      time: { type: Number, required: true }, // duration from start in seconds
      hostAScore: { type: Number, default: 0 },
      hostBScore: { type: Number, default: 0 }
    }
  ], 

   gifts: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      host: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      giftId: { type: mongoose.Schema.Types.ObjectId, ref: "Gift" },
      amount: Number,
      sentAt: { type: Date, default: Date.now }
    }
  ],

  winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

BattleSchema.index({hostA:1,hostB:1})
BattleSchema.index({status:1})
BattleSchema.index({_id:1,status:1})
module.exports = mongoose.model("Battle", BattleSchema);