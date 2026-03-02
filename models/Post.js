const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    caption: {
      type: String,
    //   trim: true,
    },

    // media: [
    //   {
    //     url: String,
    //     required:true,
    //     type: {
    //       type: String,
    //       enum: ["image", "video"],
    //     },
    //   },
    // ],

    media:[{
        url:{type:String,
            required:true
        },
    }],

    likeCount: {
      type: Number,
      default: 0,
    },

    commentCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    location:{
        type:String
    },
    //used to tag friends in your post
    tag:[
        {
     type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
PostSchema.index({likeCount: -1, commentCount: -1, viewCount: -1, createdAt: -1});
module.exports = mongoose.model("Post", PostSchema);
