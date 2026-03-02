const BaseController = require('../core/BaseController');
const Store = require('../models/Store');
const config = require('../config');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Purchase = require('../models/Purchase');
const NotificationRecipient = require('../models/NotificationRecipient');

const storeControlleradmin = new BaseController(Store,{
    name:"Store",
    access:"admin",
     create: {
    pre: async (body, req, res) => {
      const userId = req.user && req.user._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized: user required" });
        return;
      }

      body.createdBy = userId;
    },
  },
});

const purchaseStore = async (req, res) => {
  try {
    const { storeId } = req.body;
    const userId = req.user._id;

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const alreadyPurchased = await Purchase.findOne({
      userId,
      itemId: storeId,
      purchaseType: "STORE",
      status: "success",
      endDate: { $gte: new Date() }
    });

    if (alreadyPurchased) {
      return res.status(409).json({
        message: "Store already purchased",
      });
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, goldCoin: { $gte: store.price } },
      { $inc: { goldCoin: -store.price } },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        message: "Insufficient gold coins balance",
      });
    }
   const durationDays = Number(store.duration);

if (!durationDays || durationDays <= 0) {
  return res.status(400).json({
    message: "Invalid store duration",
  });
}

const startDate = new Date();
const endDate = new Date(startDate);
endDate.setDate(startDate.getDate() + durationDays);
  const [purchase,wallet,notification]  = await Promise.all([
      Purchase.create({
        userId,
        itemId: storeId,
        itemModel: "Store",
        purchaseType: "STORE",
        paidAmount: store.price,
        status: "success",
        remark: "STORE PURCHASED",
        startDate,
        endDate
      }),

      Wallet.create({
        user: userId,
        type: "debit",
        status: "success",
        source: "store_purchase",
        goldCoins: store.price,
        message: `Purchased Store: ${store.itemName}`,
      }),

      NotificationRecipient.create({
        user: userId,
        title: "Store Purchased",
        message: `You have successfully purchased Store: ${store.itemName}`,
        type: "info",
      }),
    ]);

    return res.status(200).json({
      message: "Store purchased successfully",
      purchase
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Store already purchased",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {storeControlleradmin,purchaseStore};