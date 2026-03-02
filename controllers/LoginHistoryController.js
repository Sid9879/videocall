const LoginHistory = require('../models/LoginHistory');
const mongoose = require("mongoose");

exports.getLatestLogins = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (page - 1) * limit;

    const pipeline = [
      { $sort: { createdAt: -1 } },

      {
        $group: {
          _id: "$user",
          latestLogin: { $first: "$$ROOT" },
        },
      },

      { $replaceRoot: { newRoot: "$latestLogin" } },

      { $sort: { createdAt: -1 } },

      { $skip: skip },
      { $limit: limit },

      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      {
        $project: {
          "user.password": 0,
          "user.otp": 0,
          "user.__v": 0,
      
        },
      },
    ];

    const data = await LoginHistory.aggregate(pipeline);

    const totalUsers = await LoginHistory.distinct("user").then(
      (users) => users.length
    );

    res.status(200).json({
      count:totalUsers,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
