const Post = require("../models/Post");
const Follow = require("../models/Follow");
const { pagination } = require("../utility/pagination");
const PostView = require("../models/PostView");
const UserActiveTime = require("../models/UserActiveTime");



const getTrendingPosts = async (req, res) => {
  try {
    const { limit, skip } = pagination(req);

    const posts = await Post.find({ isDeleted: false })
      .sort({ likeCount: -1, commentCount: -1, viewCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name avatar")
      .populate("tag", "name avatar");

    const count = await Post.countDocuments({ isDeleted: false });

    return res.status(200).json({
      message: "Trending posts fetched successfully",
      data: posts,
      count,
    });
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    return res.status(500).json({
      message: "Error fetching trending posts",
      error: error.message,
    });
  }
};


const postByFollowing = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit, skip } = pagination(req);

    // Get IDs of users being followed
    const followingDocs = await Follow.find({ follower: userId }).select("following");
    const followingIds = followingDocs.map((doc) => doc.following);

    //Fetch posts from those users
    const posts = await Post.find({
      userId: { $in: followingIds },
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name avatar")
      .populate("tag", "name avatar");

    const count = await Post.countDocuments({
      userId: { $in: followingIds },
      isDeleted: false,
    });

    return res.status(200).json({
      message: "Following posts fetched successfully",
      data: posts,
      count,
    });
  } catch (error) {
    console.error("Error fetching following posts:", error);
    return res.status(500).json({
      message: "Error fetching following posts",
      error: error.message,
    });
  }
};


//Record View of Post
// const recordView = async (req, res) => {
//   try {
//     const { postId } = req.params;

//     if (!postId) {
//       return res.status(400).json({ message: "Post ID is required" });
//     }

//     const post = await Post.findByIdAndUpdate(
//       postId,
//       { $inc: { viewCount: 1 } },
//       { new: true }
//     );

//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     return res.status(200).json({
//       message: "View recorded successfully",
//       viewCount: post.viewCount,
//       post
//     });
//   } catch (error) {
//     console.error("Error recording post view:", error);
//     return res.status(500).json({
//       message: "Error recording post view",
//       error: error.message,
//     });
//   }
// };


//Used only when we want to prevent duplicate views by same user and record the user who viewed the post

const recordView = async (req, res) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;

    const viewed = await PostView.findOne({ postId, userId });

    if (!viewed) {
      await PostView.create({ postId, userId });
      await Post.findByIdAndUpdate(postId, {
        $inc: { viewCount: 1 }
      });
    }

    return res.status(200).json({message:"View recorded successfully",data:viewed });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



const recordActiveTime = async (req, res) => {
  const userId = req.user._id;
  const { activeSeconds } = req.body;
try{
   
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

const recordSpend =   await UserActiveTime.findOneAndUpdate(
    { userId, date: today },
    { $inc: { activeSeconds } },
    { upsert: true }
  );

  res.json({ message:"Active time recorded successfully",data:recordSpend });
}catch(err){
    return res.status(500).json({
        success: false,
        message: err.message
    });
}
};





module.exports = {
  getTrendingPosts,
  postByFollowing,
  recordView,
  recordActiveTime,
};