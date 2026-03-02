const config = require("../config");
const BaseController = require("../core/BaseController");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Post = require('../models/Post')

const userController = new BaseController(User, {
  name: "User",
  get: {
    pagination: config.pagination,
    searchFields: ["name", "email", "mobile"],
    query: ["role"],
    select: "-password",
  },
  getById: {
    select: "-password",
  },
  create: {
    pre: async (payload, req, res) => {
      if (payload.password) {
        const salt = await bcrypt.genSalt(10);
        payload.password = await bcrypt.hash(payload.password, salt);
      }
    },
  },

  updateById: {
    pre: async (filter, updatePayload, req, res) => {
      if (updatePayload.password) {
        const salt = await bcrypt.genSalt(10);
        updatePayload.password = await bcrypt.hash(
          updatePayload.password,
          salt,
        );
      }
      if (updatePayload.role && updatePayload.role !== "host") {
        return res
          .status(403)
          .json({ message: "You can only update role to host" });
      }
    },
  },
});

userController.deleteAccount = async (req, res) => {
  try {
    const userId = req.user?._id || req.params.userId; // From token or param

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required."
      });
    }

    // const user = await User.findById(userId);
      const user = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }



    // user.isBlocked = true;
    // await user.save();

    await Post.updateMany(
      { userId: userId },
      { $set: { isDeleted: true } }
    );


    return res.status(200).json({
      message: "Your account deletion request has been received. It will be deactivated in 7 days.",
    });

  } catch (error) {
    console.error("Error in deleteAccount:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }}

userController.getVerifiedhost = async(req,res)=>{
   try{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const user = await User.find({role:"host","hostVerification.isVerified":true}).skip(skip).limit(limit).select("name avatar");
    if(!user){
     return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "Verified host fetched successfully", user,count:user.length });
   }catch(error){
    console.error("Error in getVerifiedhost:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
   }
}  

module.exports = { userController };
