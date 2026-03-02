const mongoose = require("mongoose");
const SponsorshipSchema = new mongoose.Schema(
  {
    sponsorName: {
      type: String,
      required: true,
    },
    SponsorshipType: {
      type: String,
      enum: ["event", "creator", "liveStream", "brandPromotion"],
    },
    target: {
      type: String,
    },
    SponsorshipAmount: {
      type: Number,
    },
    duration: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sponsorship", SponsorshipSchema);
