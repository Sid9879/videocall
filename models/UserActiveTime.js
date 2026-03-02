const mongoose = require("mongoose");

const UserActiveTimeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },
  date: {
    type: Date, 
    index: true
  },
  activeSeconds: {
    type: Number,
    default: 0
  }
});

UserActiveTimeSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("UserActiveTime", UserActiveTimeSchema);
