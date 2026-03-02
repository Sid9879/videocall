const AuthController = require("../core/AuthController");
const User = require("../models/User");
const Refer = require("../models/Refer");
const config = require('../config');

async function generateUniqueReferCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  const existingUser = await User.findOne({ ownReferCode: code });
  if (existingUser) {
    return generateUniqueReferCode();
  }
  return code;
}

const authConfig = {
    jwtSecret: config.jwtSecret.jwtSecret,
    jwtExpiresIn: config.jwtSecret.expiresIn,       // Optional
    loginType: 'password',         // 'password' or 'otp'
    otpField: 'email',      // 'mobile' or 'email'
    otpLimit: 5,              // OTP attempts allowed per minute
    otpExpiry: 10 * 60 * 1000, // OTP validity in milliseconds
    register: {
        pre: async (user, req, res) => {
            let code = await generateUniqueReferCode();
            user.ownReferCode = code;
            if (user.role === 'user' && req.body.referCode) {
                const referUser = await User.findOne({ ownReferCode: req.body.referCode });
                if (!referUser) {
                    return res.status(400).json({ message: "Invalid refer code" });
                }
                user.referredBy = referUser._id;
            }
        }
    },
    verifyOtp:{
        post: async (user, req, res) => {
            if (user.role === 'user' && user.referCode) {
                let referTo = user._id;
                let referCodeOwner = await User.findOne({ ownReferCode: user.referCode });
                let referFrom = referCodeOwner._id;
                const data  = await Refer.create({referCode: user.referCode, referTo, referFrom, amount: config.refer.amount});
                
            }
        }   
    }
};


const authController = new AuthController(User, authConfig)

module.exports = authController
