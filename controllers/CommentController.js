const BaseController = require("../core/BaseController");
const Comment = require("../models/Comment");
const Post = require("../models/Post");

const addComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;
    const { text, parentCommentId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (parentCommentId) {
      const parent = await Comment.findOne({
        _id: parentCommentId,
        postId,
      });

      if (!parent) {
        return res.status(400).json({ message: "Invalid parent comment" });
      }
    }

    const comment = await Comment.create({
      postId,
      userId,
      text: text.trim(),
      parentCommentId: parentCommentId || null,
    });

    await Post.findByIdAndUpdate(postId, {
      $inc: { commentCount: 1 },
    });

    res.status(201).json({
      message: parentCommentId ? "Reply added" : "Comment added",
      comment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.params;

    const comment = await Comment.findOne({
      _id: commentId,
      userId,
    });

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found or unauthorized",
      });
    }

    const totalDeleted = await Comment.countDocuments({
      $or: [{ _id: commentId }, { parentCommentId: commentId }],
    });

    // Delete parent + replies
    await Comment.deleteMany({
      $or: [{ _id: commentId }, { parentCommentId: commentId }],
    });

    await Post.findByIdAndUpdate(comment.postId, {
      $inc: { commentCount: -totalDeleted },
    });

    res.json({
      message: "Comment deleted",
      deletedCount: totalDeleted,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({
      postId,
      parentCommentId: null,
      isDeleted: false,
    })
      .populate("userId", "name username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      count: comments.length,
      comments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const replies = await Comment.find({
      parentCommentId: commentId,
      isDeleted: false,
    })
      .populate("userId", "name username avatar")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      count: replies.length,
      replies,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const editComment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { commentId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, userId, isDeleted: false },
      { text: text.trim() },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found or unauthorized",
      });
    }

    res.json({
      message: "Comment updated",
      comment,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addComment,
  deleteComment,
  getComments,
  getReplies,
  editComment,
};
