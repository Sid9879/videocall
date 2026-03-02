const mongoose = require("mongoose");
const FeedBackSchema = new mongoose.Schema(
  {
    userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    },
    category: {
      type: String,
      enum: ["appIssue"],
    },
    feedback: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", FeedBackSchema);
