const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema({
  battleId: { type: mongoose.Schema.Types.ObjectId, ref: "Battle" },
  voterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  votedFor: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

VoteSchema.index({ battleId: 1, voterId: 1 }, { unique: true });

module.exports = mongoose.model("Vote", VoteSchema);