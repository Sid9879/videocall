const mongoose = require("mongoose");

const BattleCommentSchema = new mongoose.Schema({
  battleId: { type: mongoose.Schema.Types.ObjectId, ref: "Battle" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String
}, { timestamps: true });
BattleCommentSchema.index({battleId:1,userId:1});
module.exports = mongoose.model("BattleComment", BattleCommentSchema);