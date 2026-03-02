const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const LoginHistory = require("../models/LoginHistory");
const UAParser = require("ua-parser-js");
const geoip = require("geoip-lite");
// const { OAuth2Client } = require("google-auth-library");

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthController {
  constructor(UserModel, config = {}) {
    if (!UserModel) throw new Error("UserModel is required");

    this.User = UserModel;
    this.secret = config.jwtSecret;
    this.jwtExpiresIn = config.jwtExpiresIn;
    this.loginType = config.loginType || "password";
    this.otpField = config.otpField || "mobile";
    this.otpLimit = config.otpLimit || 5;
    this.otpExpiry = config.otpExpiry || 10 * 60 * 1000;
    this.sendOtpHandler = config.sendOtp; // external OTP sender
    this.config = config;

    // Bind class methods
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.otpLogin = this.otpLogin.bind(this);
    this.sendOtp = this.sendOtp.bind(this);
    this.verifyOtp = this.verifyOtp.bind(this);
    this.logout = this.logout.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.getUser = this.getUser.bind(this);
    this.updateUser = this.updateUser.bind(this);

    this.authenticateToken = this.authenticateToken.bind(this);
    this.authorizeRole = this.authorizeRole.bind(this);
  }

  generateToken(data) {
    console.log(this.secret);
    return jwt.sign(data, this.secret, { expiresIn: this.jwtExpiresIn });
  }

  async register(req, res) {
    try {
      const { email, mobile, password } = req.body;

      if (!req.body[this.otpField]) {
        return res
          .status(400)
          .json({ message: `${this.otpField} is required` });
      }

      let query = {};
      query[this.otpField] = req.body[this.otpField];

      let existing = await this.User.findOne(query).lean();

      if (existing && existing.isVerified == false) {
        await this.User.findByIdAndDelete(existing._id);
      }
      if (existing)
        return res.status(400).json({ message: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      let otp = Math.floor(100000 + Math.random() * 900000).toString();
      if (req.body.role == "admin" || req.body.role == "Admin") {
        return res
          .status(400)
          .json({ message: "Admin registration is not allowed" });
      }
      const user = new this.User({
        ...req.body,
        email,
        mobile,
        password: hashedPassword,
        isVerified: false,
        otp: [
          {
            otp: this.sendOtpHandler ? otp : "123456",
            createdAt: Date.now(),
          },
        ],
      });
      if (this.config.register && this.config.register.pre) {
        await this.config.register.pre(user, req, res);
      }
      await user.save();

      if (this.sendOtpHandler) {
        try {
          await this.sendOtpHandler(user[this.otpField], otp);
        } catch (err) {
          console.error("Error sending OTP:", err);
          return res
            .status(500)
            .json({ message: "Error sending OTP", error: err.message });
        }
      }

      let userData = user.toObject();
      delete userData.password;
      delete userData.otp;
      delete userData.isBlocked;
      delete userData.isVerified;

      if (this.config.register && this.config.register.post) {
        await this.config.register.post(userData, req, res);
      }
      return res
        .status(201)
        .json({ message: "User registered", user: userData });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
  }

  async login(req, res) {
    if (this.loginType === "otp") return this.otpLogin(req, res);
    try {
      const { password } = req.body;

      if (this.config.login && this.config.login.pre) {
        await this.config.login.pre(req.body, req, res);
      }

      if (!req.body[this.otpField]) {
        return res
          .status(400)
          .json({ message: `${this.otpField} is required` });
      }

      let query = {};
      query[this.otpField] = req.body[this.otpField];

      let user = await this.User.findOne(query);

      if (!user) return res.status(404).json({ message: "User not found" });
      if (!user.isVerified)
        return res.status(401).json({ message: "User not verified" });
      if (user.isBlocked)
        return res.status(401).json({ message: "User is blocked" });
        if (user.isDeleted)
        return res.status(401).json({ message: "User not found"  });
      if (!user.isApproved)
        return res.status(401).json({
          message:
            "Your account is not approved yet. Please wait for admin approval.",
        });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: "Invalid password" });
     const rawIp =
      req.headers["cf-connecting-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const ipAddress =
      rawIp === "::1" ? "127.0.0.1" : rawIp.replace("::ffff:", "");

    const geo = geoip.lookup(ipAddress);

    const parser = new UAParser(req.headers["user-agent"]);
    const ua = parser.getResult();

    await LoginHistory.create({
      user: user._id,
      ipAddress,
      browser: `${ua.browser.name} ${ua.browser.version}`,
      os: `${ua.os.name} ${ua.os.version}`,
      deviceType: ua.device.type || "desktop",
      userAgent: req.headers["user-agent"],

      country: geo?.country || null,
      region: geo?.region || null,
      city: geo?.city || null,
      timezone: geo?.timezone || null,
      latitude: geo?.ll?.[0] || null,
      longitude: geo?.ll?.[1] || null,
    });
      await this.User.findByIdAndUpdate(user._id, {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      });
      const token = this.generateToken({
        _id: user._id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      });
      delete user.password;
      delete user.otp;
      delete user.isBlocked;
      delete user.isVerified;
      if (this.config.login && this.config.login.post) {
        await this.config.login.post(user, req, res);
      }

      return res.status(200).json({ message: "Login successful", user, token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  async otpLogin(req, res) {
    try {
      const { otp } = req.body;
      if (!req.body[this.otpField]) {
        return res
          .status(400)
          .json({ message: `${this.otpField} is required` });
      }

      let query = {};
      query[this.otpField] = req.body[this.otpField];

      let user = await this.User.findOne(query).lean();

      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.role == "admin" && !user.isVerified)
        return res.status(401).json({ message: "User not verified" });
      if (user.isBlocked)
        return res.status(401).json({ message: "User is blocked" });
      if (user.otp[user.otp.length - 1].otp !== otp)
        return res.status(401).json({ message: "Invalid OTP" });

      const token = this.generateToken({
        _id: user._id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      });

      delete user.otp;
      delete user.password;

      return res
        .status(200)
        .json({ message: "OTP login successful", token, user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  async sendOtp(req, res) {
    try {
      if (!req.body[this.otpField]) {
        return res
          .status(400)
          .json({ message: `${this.otpField} is required` });
      }

      let query = {};
      query[this.otpField] = req.body[this.otpField];
      let user = await this.User.findOne(query);

      if (!user) {
        if (this.loginType === "otp") {
          user = new this.User({ ...req.body, isVerified: false, otp: [] });
        } else {
          return res.status(404).json({ message: "User not found" });
        }
      }

      if (user.otp.length === this.otpLimit) {
        const oneMinuteAgo = Date.now() - 60 * 1000;
        const recentOtp = user.otp.filter(
          (otp) => otp.createdAt > oneMinuteAgo
        );

        if (recentOtp.length === this.otpLimit) {
          return res
            .status(429)
            .json({ message: "OTP limit exceeded. Please try again later." });
        }

        const elementToDelete = this.otpLimit - recentOtp.length;
        if (elementToDelete > 0) {
          user.otp.splice(0, elementToDelete);
        }
      }

      let otp = Math.floor(100000 + Math.random() * 900000).toString();
      if (this.sendOtpHandler) {
        try {
          await this.sendOtpHandler(req.body[this.otpField], otp);
        } catch (err) {
          console.error("Error sending OTP:", err);
          return res
            .status(500)
            .json({ message: "Error sending OTP", error: err.message });
        }
      } else {
        otp = "123456";
      }

      user.otp.push({
        otp,
        createdAt: Date.now(),
      });
      await user.save();

      return res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Error sending OTP", error: err.message });
    }
  }

  async verifyOtp(req, res) {
    try {
      if (!req.body[this.otpField]) {
        return res
          .status(400)
          .json({ message: `${this.otpField} is required` });
      }

      if (this.config.verifyOtp && this.config.verifyOtp.pre) {
        await this.config.verifyOtp.pre(req.body, req, res);
      }

      let user = await this.User.findOne({
        [this.otpField]: req.body[this.otpField],
      });

      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.otp.length === 0)
        return res.status(400).json({ message: "No OTP found" });
      if (user.otp[user.otp.length - 1].otp === req.body.otp) {
        user.isVerified = true;
        user.isBlocked = false; // Unblock user on successful verification
        user.otp = [];
        await user.save();
        if (this.config.verifyOtp && this.config.verifyOtp.post) {
          await this.config.verifyOtp.post(user, req, res);
        }
        return res.status(200).json({ message: "OTP verified" });
      }

      return res.status(400).json({ message: "Invalid OTP" });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Error verifying OTP", error: err.message });
    }
  }

  async logout(req, res) {
    return res.status(200).json({ message: "Logout successful" });
  }

  async forgotPassword(req, res) {
    return this.sendOtp(req, res);
  }

  async resetPassword(req, res) {
    try {
      const { otp, password } = req.body;
      if (!otp || !password)
        return res.status(400).json({ message: "All fields are required" });

      if (!req.body[this.otpField]) {
        return res
          .status(400)
          .json({ message: `${this.otpField} is required` });
      }

      let query = {};
      query[this.otpField] = req.body[this.otpField];
      const user = await this.User.findOne(query);

      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.otp.length === 0)
        return res.status(400).json({ message: "No OTP found" });
      if (user.otp[user.otp.length - 1].otp === req.body.otp) {
        const hashed = await bcrypt.hash(password, 10);
        const updated = await this.User.findOneAndUpdate(
          query,
          { password: hashed },
          { new: true }
        );
        if (!updated)
          return res.status(404).json({ message: "User not found" });
        return res
          .status(200)
          .json({ message: "Password updated", user: updated });
      }

      return res.status(400).json({ message: "Invalid OTP" });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Error resetting password", error: err.message });
    }
  }

  async getUser(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const user = await this.User.findById(userId).lean();
      //             .populate('subscriptionPurchase').populate("city").populate('category').populate("zone").populate({
      //     path: "subscriptionPurchase",
      //     populate: {
      //       path: "planId",
      //     }
      //   });

      delete user.password;
      delete user.otp;
      delete user.isBlocked;
      delete user.isVerified;

      return res.status(200).json({ message: "User retrieved", user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }

  async updateUser(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const updates = req.body;
      if (
        updates.otp ||
        updates.isVerified ||
        updates.isBlocked ||
        updates.role
      ) {
        return res
          .status(400)
          .json({ message: "Cannot update restricted fields" });
      }

      if (updates.currentPassword) {
        const user = await this.User.findById(userId);

        const match = await bcrypt.compare(
          updates.currentPassword,
          user.password
        ); // Correct
        if (!match) {
          return res
            .status(401)
            .json({ message: "Current password is incorrect" });
        }

        updates.password = await bcrypt.hash(updates.password, 10); // Hash the NEW password only
        delete updates.currentPassword;
      }
      const user = await this.User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
      }).lean();
      delete user.password;
      delete user.otp;
      delete user.isBlocked;
      delete user.isVerified;
      return res.status(200).json({ message: "User updated", user });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Error updating user", error: err.message });
    }
  }

  async authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    try {
      // Verify the token and extract the payload

      const decoded = jwt.verify(token, this.secret);
      req.token = token;
      req.user = decoded;

      const { role } = decoded;

      // Find the user with the given role and token in the database
      const user = await this.User.findOne({ role, _id: decoded._id });
      if (!user) {
        return res
          .status(401)
          .json({ message: "Invalid token or user not found." });
      }

      if (user.isBlocked) {
        return res.status(403).json({ message: "User blocked" });
      }

      // Attach the user to the request object
      req.user = user;
      next();
    } catch (err) {
      console.error(err);
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({
          message: "Access denied. Token has expired.",
        });
      }
      return res.status(403).json({
        message: "Access denied. Invalid token.",
      });
    }
  }

  authorizeRole(role) {
    return function (req, res, next) {
      const token = req.token;

      if (!token) {
        return res
          .status(401)
          .json({ message: "Access denied. No token provided." });
      }

      const userRole = req.user?.role;

      if (typeof role === "string" && userRole === role) {
        return next();
      } else if (Array.isArray(role) && role.includes(userRole)) {
        return next();
      } else {
        return res.status(403).json({
          message:
            "Insufficient permissions. Your role does not have access to this API.",
        });
      }
    };
  }

  // authProvider: {
  //   type: String,
  //   enum: ["local", "google"],
  //   default: "local"
  // },
  // npm install google-auth-library

  async googleLogin(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ message: "idToken required" });
      }

      // Verify token with Google
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture, email_verified } = payload;

      if (!email_verified) {
        return res
          .status(401)
          .json({ message: "Email not verified by Google" });
      }

      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          googleId,
          email,
          name,
          avatar: picture,
          authProvider: "google",
        });
      }

      // const token = jwt.sign(
      //   { _id: user._id, email: user.email, role: user.role },
      //   process.env.JWT_SECRET,
      //   { expiresIn: "1d" }
      // );
      const token = this.generateToken({
        _id: user._id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      });

      // res.cookie("token", token, {
      //   httpOnly: true,
      //   secure: true,
      //   sameSite: "None",
      //   maxAge: 24 * 60 * 60 * 1000
      // });

      return res.status(200).json({ message: "Login successful", user, token });
    } catch (error) {
      console.error("Google login error:", error);
      res.status(500).json({
        message: "Google login failed",
        error: error.message,
      });
    }
  }
}

module.exports = AuthController;
