const mongoose = require("mongoose");

const LoginHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ipAddress: String,
    browser: String,
    os: String,
    deviceType: String,
    userAgent: String,
    country: String,
    region: String,
    city: String,
    timezone: String,
    latitude: Number,
    longitude: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model("LoginHistory", LoginHistorySchema);
