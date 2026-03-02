const Follow = require("../models/Follow");
const User = require("../models/User");

exports.toggleFollowAndUnfollow = async (req, res) => {
  try {
    const followerId = req.user._id;
    const { userId } = req.params; // user to follow/unfollow

    if (followerId.toString() === userId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: userId,
    });

    if (existingFollow) {
     
      await existingFollow.deleteOne();

      await User.findByIdAndUpdate(followerId, {
        $inc: { followingCount: -1 },
      });

      await User.findByIdAndUpdate(userId, {
        $inc: { followersCount: -1 },
      });

      return res.json({
        message: "Unfollowed successfully",
        isFollowing: false,
      });
    }

  
    await Follow.create({
      follower: followerId,
      following: userId,
    });

    await User.findByIdAndUpdate(followerId, {
      $inc: { followingCount: 1 },
    });

    await User.findByIdAndUpdate(userId, {
      $inc: { followersCount: 1 },
    });

    return res.status(201).json({
      message: "Followed successfully",
      isFollowing: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.unfollowAll = async (req, res) => {
  try {
    const userId = req.user._id;

    const following = await Follow.find({ follower: userId });

    const followingIds = following.map((f) => f.following);

    await Follow.deleteMany({ follower: userId });

    // Reset user's following count
    await User.findByIdAndUpdate(userId, {
      $set: { followingCount: 0 },
    });

    // Decrease followers count of all users he was following
    await User.updateMany(
      { _id: { $in: followingIds } },
      { $inc: { followersCount: -1 } },
    );

    res.json({ message: "Unfollowed all users" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const followers = await Follow.find({ following: userId })
      .populate("follower", "name avatar")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Follow.countDocuments({ following: userId });

    res.json({
      // page,
      // totalPages: Math.ceil(total / limit),
      count: total,
      data:followers,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const following = await Follow.find({ follower: userId })
      .populate("following", "name avatar")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Follow.countDocuments({ follower: userId });

    res.json({
      // page,
      // totalPages: Math.ceil(total / limit),
      count: total,
      data:following,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
