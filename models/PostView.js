const mongoose = require("mongoose");

const PostViewSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  }
}, { timestamps: true });

PostViewSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("PostView", PostViewSchema);