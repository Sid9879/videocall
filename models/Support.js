const mongoose = require("mongoose");

const SupportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // name: {
    //   type: String,
    // },
    // email:{
    //     type:String,
    // },
    subject: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["high", "low", "medium"],
    },
    status: {
      type: String,
      enum: ["open", "inProgress", "resolved"],
      default: "open",
    },
    assign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Support", SupportSchema);
