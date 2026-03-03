// controllers/leaderboardController.js
const HostLeaderboard = require("../models/HostLeaderboard");

exports.getHostLeaderboard = async (req, res) => {
  try {
    const userId = req.user?._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { type = "daily" } = req.query;

    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const now = new Date(Date.now() + IST_OFFSET);

    let startDate, endDate;

    if (type === "weekly") {
      const day = now.getDay() || 7;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - (day - 1));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
    } else {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);
    }

    const startUTC = new Date(startDate.getTime() - IST_OFFSET);
    const endUTC = new Date(endDate.getTime() - IST_OFFSET);

    const matchStage = {
      date: { $gte: startUTC, $lt: endUTC }
    };

    //Build rank array (ALL users)
    const rankedIds = await HostLeaderboard.aggregate([
      { $match: matchStage },
      { $sort: { receivedCoinValue: -1 } },
      {
        $group: {
          _id: null,
          ids: { $push: "$hostId" }
        }
      }
    ]);

    const idArray = rankedIds[0]?.ids || [];

    //TOP 3
    const top3 = await HostLeaderboard.find(matchStage)
      .sort({ receivedCoinValue: -1 })
      .limit(3)
      .populate("hostId", "name avatar")
      .lean()
      .then(list =>
        list.map((item, index) => ({
          ...item,
          rank: index + 1
        }))
      );

    //TOP 50
    const top50 = await HostLeaderboard.find(matchStage)
      .sort({ receivedCoinValue: -1 })
      .limit(50)
      .populate("hostId", "name avatar")
      .lean()
      .then(list =>
        list.map((item, index) => ({
          ...item,
          rank: index + 1
        }))
      );

    //ALL USERS
    const leaderboard = await HostLeaderboard.find(matchStage)
      .sort({ receivedCoinValue: -1 })
      .skip(skip)
      .limit(limit)
      .populate("hostId", "name avatar")
      .lean()
      .then(list =>
        list.map((item, index) => ({
          ...item,
          rank: skip + index + 1
        }))
      );

    //Logged-in user rank (always)
    let loggedInUser = null;

    if (userId) {
      const userIndex = idArray.findIndex(
        id => id.toString() === userId.toString()
      );

      if (userIndex !== -1) {
        const userData = await HostLeaderboard.findOne({
          ...matchStage,
          hostId: userId
        })
          .populate("hostId", "name avatar")
          .lean();

        loggedInUser = {
          ...userData,
          rank: userIndex + 1
        };
      }
    }
const totalUsers = await HostLeaderboard.countDocuments(matchStage);
    res.status(200).json({
      success: true,
      type,
      top3,        
      top50,       
      leaderboard, 
      YourRank:loggedInUser,
      count: totalUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error loading leaderboard"
    });
  }
};