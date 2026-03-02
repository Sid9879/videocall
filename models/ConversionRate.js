const mongoose = require("mongoose");

const ConversionRateSchema = new mongoose.Schema(
  {
    // Example: "COIN_TO_INR", "DIAMOND_TO_INR", "GIFT_TO_COIN"
    type: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    fromCurrency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      // Example: COIN, DIAMOND, GIFT, POINT
    },

    toCurrency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      // Example: INR, USD, COIN
    },

    // Example: 1 COIN = 0.10 INR as per Figma
    rate: {
      type: Number,
      required: true,
      min: 0,
    },

    hostCommission: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
      // Example: 40 = 40%
    },

    platformCommission: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },

    agencyCommission: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },

    totalCommission: {
      type: Number,
      min: 0,
      max: 100,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ConversionRate", ConversionRateSchema);