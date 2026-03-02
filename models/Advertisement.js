const mongoose = require("mongoose");
const AdvertisementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    advertiserName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    placement: {
      type: String,
      enum: ["homeBanner", "liveStream", "sidebar"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    revenueAmount: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Advertisement", AdvertisementSchema);
