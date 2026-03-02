const mongoose  = require('mongoose');

const LiveHistoryRecordSchema = new mongoose.Schema({
  battleId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Battle",
    required:true
  },
  hostA:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  hostB:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  hostAGifts:{
    type:Number,
    default:0
  },
  hostBGifts:{
    type:Number,
    default:0
  },
  participatedUsers:[
    {
      userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
      },
      joinedAt:{
        type:Date,
        default:Date.now
      }
    }
  ],

 }, { timestamps: true }); 

 LiveHistoryRecordSchema.index({battleId:1})
 module.exports = mongoose.model("LiveHistoryRecord", LiveHistoryRecordSchema);
