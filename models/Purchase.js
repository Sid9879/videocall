const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    screenshot: {
      type: String, 
    },

    paidAmount: {
      type: Number, 
      required: true,
    },

    requestedCoins: {
      type: Number, 
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected","success"],
      default: "pending",
      index: true,
    },
  
  purchaseType: {
    type: String,
    enum: ["GIFT", "VIP", "RECHARGE","STORE","BATTLE_GIFT"],
    required: true
  },
  
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "itemModel"  
  },

  itemModel: {
    type: String,
    enum: ["Gift", "VIPTIER", "RechargePlan","Store"],
    required: true
  },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt:{
        type:Date
    },

    remark:{
        type:String  // admin comment if rejected
    }, 

    // for store and vip
    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", PurchaseSchema);