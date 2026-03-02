const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    avatar: {
      type: String,
    },

    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      unique: true,
    },
    bio:{
      type: String,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    age: {
      type: Number,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "agency", "user", "businessDevelopment", "host"],
      default: "user",
      required: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role", // Reference Role model
      required: false, // Only required if you want panel permission enforcement
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference User model
      required: false, // Only required if you want panel permission enforcement
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    otp: [
      {
        otp: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },

    //Address
    address: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    pincode: {
      type: String,
    },

    //Agency Partner
    agencyName: {
      type: String,
    },
    idProof: {
      type: String, //for agency to upload addharc passport license
    },

    //Documents
    // panNo: {
    //   type: String,
    // },
    // panImg: {
    //   type: String,
    // },
    // aadharNo: {
    //   type: String,
    // },
    // aadharFront: {
    //   type: String,
    // },
    // aadharBack: {
    //   type: String,
    // },
    // gstNo: {
    //   type: String,
    // },

    //Bank details
    bankName: {
      type: String,
    },
    accountNo: {
      type: String,
    },
    ifscCode: {
      type: String,
    },
    upiId: {
      type: String,
      trim: true,
    },

    commissionRate: {
      type: Number,
    },
    hostVerification: {
      isVerified: { type: Boolean, default: false },
      date: { type: Date },
      matchScore: { type: Number, min: 0, max: 100 },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rejectionReason: { type: String },
    },
    //Face verification
    liveImage: {
      type: String,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    targetRegion: {
      type: String,
      enum: ["india", "europe", "middleEast", "unitedState"],
    },

    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    ownReferCode: {
      type: String,
      unique: true,
      sparse: true, // helps avoid duplicate index errors
      trim: true,
    },

    referCode: {
      type: String,
      trim: true, // this will store the code entered by the user during registration
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lastLoginAt: {
      type: Date,
    },
    lastLoginIp: {
      type: String,
    },

    diamondWallet: { type: Number, min: 0, default: 0 }, //used as store diamonds
    goldCoin:{type:Number,min:0,default:0}, //store gold coin
    
    // VIP Fields
    vipTier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VIPTIER",
      default: null
    },
    vipExpiry: {
      type: Date,
      default: null
    },
    isVip: {
      type: Boolean,
      default: false
    },

    level: {
      type: Number,
      default: 1,
    },

    xp: {
      type: Number,
      default: 0,
    },

    nextLevelXp: {
      type: Number,
      default: 100,
    },
    
    //Medal
    medal:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Medal"
    },

    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    giftReceivedCount: { type: Number, default: 0 },
    giftReceivedValue: { type: Number, default: 0 }
  },
  { timestamps: true },
);
UserSchema.index({ followers: 1 });
UserSchema.index({ following: 1 });
UserSchema.index({role:1,"hostVerification.isVerified":1})

module.exports = mongoose.model("User", UserSchema);
