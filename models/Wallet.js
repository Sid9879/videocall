const mongoose = require("mongoose");
const TransactionType = {
  CREDIT: "credit",
  DEBIT: "debit",
  // INITIATE: "initiate",
};

const TransactionStatus = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
};
const TransactionSource = {
  ADDED_DIAMOND:"added_diamond",
  WITHDRAW_DIAMOND:"withdraw_diamond",
  REFERRAL_BONUS:"referral_bonus",
  ADDED_COINS:"added_coins",
  VIP_PURCHASE: "vip_purchase",
  GIFT_RECEIVED:"gift_received",
  GIFT_SENT:"gift_sent",
  BATTLE_GIFT_SENT:"battle_gift_sent",
  BATTLE_GIFT_RECEIVED:"battle_gift_received",
  STORE_PURCHASE:"store_purchase"
};
const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  //uncomment if payment approved and paidBy different-different user
  // approvedBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  // },  
  paidBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }, //store admin id
  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: true,
  },

  status: {
    type: String,
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.SUCCESS,
  },
  source: {
    type: String,
    enum: Object.values(TransactionSource),
    required: true,
  },
    role: {
    type: String,
    enum: ["agency", "admin"],
  },  //store who rejected 
  message: {
    type: String,  //store message like admin why rejected or agency rejected or any other message
  },
  paymentStatus: {
    type: String,
    enum: ["approved", "rejected", "paid", "pending","failed"],
  },
  requestedAt:{
    type:Date
  },
  diamond: {
    type: Number,
  },
  goldCoins: {
    type: Number,
  },
  paidData: {
    amountInINR: {
      type: Number,
    },
    transactionId: { type: String },
    transactionProof: {
      type: String,
    },
    userName: { type: String },
    paidAt: { type: Date },
  },
  isSettlementRequested: { type: Boolean, default: false }, //store if agency request for settlement
  isSettled: { type: Boolean, default: false }, //store if agency is settled
  settledAt: { type: Date }, //store settlement date
  initiatedBy: { type: String, enum: ["admin", "agency"] }, //store who make payment

},{timestamps:true});

module.exports = mongoose.model('Wallet',WalletSchema);
