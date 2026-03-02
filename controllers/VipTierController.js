const BaseController = require('../core/BaseController');
const VipTier = require('../models/VipTier');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Purchase = require('../models/Purchase');
const NotificationRecipient = require('../models/NotificationRecipient');

const vipTieradminController = new BaseController(VipTier,{
    name:"VIP TIER",
    access:"admin",
});



//VIP-TIER for user....
const vipTieruserController = new BaseController(VipTier,{
    name:"VIP TIER",
})

vipTieruserController.buyVipTier = async (req, res) => {
    try {
        const { tierId } = req.body;
        const userId = req.user._id;

        const tier = await VipTier.findById(tierId);
        if (!tier) {
            return res.status(404).json({ message: "VIP Tier not found" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.goldCoin < tier.price) {
            return res.status(400).json({ message: "Insufficient gold coins balance" });
        }

        // Deduct coins
        user.goldCoin -= tier.price;

        // Set VIP status and expiry
        user.isVip = true;
        user.vipTier = tier._id;
        
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (tier.duration));
        user.vipExpiry = expiryDate;

        await user.save();

        const purchase = new Purchase({
            userId,
            itemId:tierId,
            itemModel:"VIPTIER",
            purchaseType:"VIP",
            paidAmount: tier.price,
            status: "success",
            remark:"VIP TIER PURCHASED",
            startDate: new Date(),
            endDate: expiryDate,
        });
        await purchase.save();

        // Log transaction in Wallet
        const transaction = new Wallet({
            user: userId,
            type: "debit",
            status: "success",
            source: "vip_purchase",
            goldCoins: tier.price,
            message: `Purchased VIP Tier: ${tier.tierName}`
        });
        await transaction.save();
        const notification = new NotificationRecipient({
            user: userId,
            title: "VIP Tier Purchased",
            message: `You have successfully purchased VIP Tier: ${tier.tierName}`,
            type: "success",
        });
        await notification.save();
        res.status(200).json({
            message: "VIP Tier purchased successfully",
            user: {
                goldCoin: user.goldCoin,
                isVip: user.isVip,
                vipExpiry: user.vipExpiry,
                vipTier: user.vipTier
            }
        });

    } catch (error) {
        console.error("Error in buyVipTier:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

module.exports = { vipTieradminController,vipTieruserController};