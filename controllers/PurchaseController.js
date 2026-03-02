const BaseController = require("../core/BaseController");
const PurchaseSchema = require("../models/Purchase");
const Notification = require("../models/NotificationRecipient");
const Wallet = require('../models/Wallet')
const User = require("../models/User");

const PurchaseController = new BaseController(PurchaseSchema, {
  name: "TopUp Request",
  access: "user",
  accesskey: "userId",
  create: {
    post: async (data, req, res) => {
      try {
        const notification = new Notification({
          user: req.user._id,
          title: "TopUp request",
          message:
            "Your topUp request is submitted successfully, You will get the message of credit sortly",
          type: "info",
        });
        await notification.save();
        const user = await User.findOne({role:"admin"});
        const adminNotification = new Notification({
          user: user._id,
          title: "TopUp Request",
          message: `User ${req.user.name} has submitted topUp request`,
          type: "info",
        });
        await adminNotification.save();
        return data
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    },
  },
  get:{
    populate:[{path:"itemId"}]
  }
});

const PurchaseControlleradmin = new BaseController(PurchaseSchema, {
  name: "TopUp Request",
  access: "admin",
});


//Only Work in purchaseType is goldCoin
PurchaseControlleradmin.approvePurchase = async (req, res) => {
  try {
    const { requestId } = req.params;
    const adminId = req.user._id;

    const Purchase = await PurchaseSchema.findOne({
      _id: requestId,
      status: "pending",
    });
    
    if (!Purchase) {
      return res.status(400).json({
        message: "Top-up request already processed or not found",
      });
    }

    const user = await User.findByIdAndUpdate(
      Purchase.userId,
      {
        $inc: { goldCoin: Purchase.requestedCoins },
      },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    Purchase.status = "success";
    Purchase.reviewedBy = adminId;
    Purchase.reviewedAt = new Date();
    

    await Purchase.save();

    const wallet = new Wallet({
      user: Purchase.userId,
      type: "credit",
      source: "added_coins",
      goldCoins: Purchase.requestedCoins,
      paidBy:adminId,
      initiatedBy: "admin",
      status:"success"
    });
    await wallet.save();
    const notification = new Notification({
      user: Purchase.userId,
      title: "TopUp request",
      message: `Your topUp request is approved,Your account credit with goldCoin ${Purchase.requestedCoins}`,
      type: "success",
    });
    await notification.save();

    return res.json({
      message: "Top-up approved and coins credited successfully",
      creditedCoins: Purchase.requestedCoins,
      userBalance: user.goldCoin,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to approve top-up request",
    });
  }
};

PurchaseControlleradmin.rejectPurchase = async (req, res) => {
  try {
    const { requestId } = req.params; //purchase id _id
    const adminId = req.user._id;
    const {remark} = req.body;

    const Purchase = await PurchaseSchema.findOne({
      _id: requestId,
      status: "pending",
    });
    
    if (!Purchase) {
      return res.status(400).json({
        message: "Top-up request already processed or not found",
      });
    }

    Purchase.status = "rejected";
    Purchase.reviewedBy = adminId;
    Purchase.reviewedAt = new Date();
    Purchase.remark = remark;

    await Purchase.save();

    const notification = new Notification({
      user: Purchase.userId,
      title: "TopUp request",
      message: `Your topUp request is rejected`,
      type: "info",
    });
    await notification.save();

    return res.json({
      message: "Top-up rejected successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to reject top-up request",
    });
  }
};

PurchaseController.getYourPurchaseStore = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user._id;
    const Purchase = await PurchaseSchema.find({
      userId,
      purchaseType: "STORE",
      status:"success"
    }).skip(skip).limit(limit).populate("itemId").sort({createdAt:-1});
    return res.json({
      message: "Your purchase store",
      data: Purchase,
      count:Purchase.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to get your purchase store",
    });
  }
};

module.exports = {
  PurchaseController,
  PurchaseControlleradmin,
};
