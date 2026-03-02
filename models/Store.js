const mongoose = require("mongoose");
const storeSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type:{
      type:String,
      enum:["entryEffect","avatarFrame","starZone"],
      required:true
    },
    itemName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
    },
    duration: {
      type: Number,  //Store no. of days
      required: true,
    },
    category: {
      type: String,
    },
    rarity: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Store", storeSchema);
