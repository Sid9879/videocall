const Like = require("../models/Like");
const Post = require("../models/Post");

const toggleLike = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    const existingLike = await Like.findOne({ postId, userId });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });

      await Post.findByIdAndUpdate(postId, {
        $inc: { likeCount: -1 },
      });

      return res.json({
        message: "Post unliked",
        liked: false,
      });
    }

    await Like.create({ postId, userId });

    await Post.findByIdAndUpdate(postId, {
      $inc: { likeCount: 1 },
    });

    res.json({
      message: "Post liked",
      liked: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getlikeByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get all likes with user details
    const likes = await Like.find({ postId }).populate(
      "userId",
      "name email avatar"
    );

    res.json({
      success: true,
      postId,
      likeCount: post.likeCount || 0,
      likedBy: likes.map((like) => like.userId),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  toggleLike,
  getlikeByPost,
};
