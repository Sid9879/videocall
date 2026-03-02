const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    star: {
      type: Number,
    },
    message: {
      type: String,
    },
    agency: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

reviewSchema.index({agency:1});

module.exports = mongoose.model("Review", reviewSchema);