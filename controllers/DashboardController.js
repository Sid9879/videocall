const UserActiveTime = require("../models/UserActiveTime");
const secondsToHM = require('../utility/timeChange');
const User = require("../models/User");
const Purchase = require("../models/Purchase");


const getActiveTimeStats = async (req, res) => {
  const userId = req.user._id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const monthStart = new Date(today);
  monthStart.setDate(1);

  const data = await UserActiveTime.aggregate([
    {
      $match: {
        userId,
        date: { $gte: monthStart }
      }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$date", today] },
            "today",
            {
              $cond: [
                { $eq: ["$date", yesterday] },
                "yesterday",
                "month"
              ]
            }
          ]
        },
        totalSeconds: { $sum: "$activeSeconds" }
      }
    }
  ]);

  let totals = { today: 0, yesterday: 0, monthly: 0 };

  data.forEach(d => {
    if (d._id === "today") totals.today = d.totalSeconds;
    if (d._id === "yesterday") totals.yesterday = d.totalSeconds;
    if (d._id === "month") totals.monthly += d.totalSeconds;
  });

  res.json({
     message:"User dashboard fetched successfully",
   spend:{
     today: secondsToHM(totals.today),
    yesterday: secondsToHM(totals.yesterday),
    monthly: secondsToHM(totals.monthly)
   }
  });
};

//Coin Management Panel Dashboard
const CoinMangementDashboardStats = async (req, res) => {
  try {
    const now = new Date();

    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);

    const goldCoinAgg = await User.aggregate([
      {
        $group: {
          _id: null,
          totalGoldCoin: { $sum: "$goldCoin" },
          lastMonthGoldCoin: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfPreviousMonth] },
                    { $lte: ["$createdAt", endOfPreviousMonth] }
                  ]
                },
                "$goldCoin",
                0
              ]
            }
          }
        }
      }
    ]);

    const totalGoldCoin = goldCoinAgg[0]?.totalGoldCoin || 0;
    const lastMonthGoldCoin = goldCoinAgg[0]?.lastMonthGoldCoin || 0;

    const goldCoinPercentageChange =
      lastMonthGoldCoin > 0
        ? ((totalGoldCoin - lastMonthGoldCoin) / lastMonthGoldCoin) * 100
        : 0;

    const rechargeAgg = await Purchase.aggregate([
      {
        $match: {
          purchaseType: "RECHARGE",
          status: "success"
        }
      },
      {
        $group: {
          _id: null,

          // All time
          totalRequestedCoinsAllTime: { $sum: { $ifNull: ["$requestedCoins", 0] } },
          totalPaidAmount: { $sum: { $ifNull: ["$paidAmount", 0] } },

          // Current month
          currentMonthCoins: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfCurrentMonth] },
                    { $lte: ["$createdAt", endOfCurrentMonth] }
                  ]
                },
                { $ifNull: ["$requestedCoins", 0] },
                0
              ]
            }
          },
          currentMonthPaidAmount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfCurrentMonth] },
                    { $lte: ["$createdAt", endOfCurrentMonth] }
                  ]
                },
                { $ifNull: ["$paidAmount", 0] },
                0
              ]
            }
          },

          // Previous month
          previousMonthCoins: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfPreviousMonth] },
                    { $lte: ["$createdAt", endOfPreviousMonth] }
                  ]
                },
                { $ifNull: ["$requestedCoins", 0] },
                0
              ]
            }
          },
          previousMonthPaidAmount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfPreviousMonth] },
                    { $lte: ["$createdAt", endOfPreviousMonth] }
                  ]
                },
                { $ifNull: ["$paidAmount", 0] },
                0
              ]
            }
          },
          previousMonthTransactions: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfPreviousMonth] },
                    { $lte: ["$createdAt", endOfPreviousMonth] }
                  ]
                },
                1,
                0
              ]
            }
          },

          // Today
          todayCoins: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfToday] },
                    { $lte: ["$createdAt", endOfToday] }
                  ]
                },
                { $ifNull: ["$requestedCoins", 0] },
                0
              ]
            }
          },
          todayPaidAmount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfToday] },
                    { $lte: ["$createdAt", endOfToday] }
                  ]
                },
                { $ifNull: ["$paidAmount", 0] },
                0
              ]
            }
          },
          todayTransactions: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfToday] },
                    { $lte: ["$createdAt", endOfToday] }
                  ]
                },
                1,
                0
              ]
            }
          },

          // Yesterday
          yesterdayCoins: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfYesterday] },
                    { $lte: ["$createdAt", endOfYesterday] }
                  ]
                },
                { $ifNull: ["$requestedCoins", 0] },
                0
              ]
            }
          },
          yesterdayPaidAmount: {
             $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfYesterday] },
                    { $lte: ["$createdAt", endOfYesterday] }
                  ]
                },
                { $ifNull: ["$paidAmount", 0] },
                0
              ]
            }
          },
          yesterdayTransactions: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", startOfYesterday] },
                    { $lte: ["$createdAt", endOfYesterday] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const recharge = rechargeAgg[0] || {};

    const rechargePercentageChange =
      recharge.yesterdayCoins > 0
        ? Math.abs(((recharge.todayCoins - recharge.yesterdayCoins) /
            recharge.yesterdayCoins) *
          100)
        : 0;

    const totalTransactionsTodayAndYesterday =
      (recharge.todayTransactions || 0) + (recharge.yesterdayTransactions || 0);

    const totalPaidAmountTodayAndYesterday =
      (recharge.todayPaidAmount || 0) + (recharge.yesterdayPaidAmount || 0);

    const avgTransactionValueTodayAndYesterday =
      totalTransactionsTodayAndYesterday > 0
        ? totalPaidAmountTodayAndYesterday / totalTransactionsTodayAndYesterday
        : 0;

    return res.status(200).json({
      success: true,

      goldCoin: {
        totalGoldCoin,
        // lastMonthGoldCoin,
        // percentageChange: Number(goldCoinPercentageChange.toFixed(2))
      },

      recharge: {
        todayCoinPurchase: recharge.todayCoins || 0, // Today's requested coins
        allTimePaidAmount: recharge.totalPaidAmount || 0, // All time paid amount

        // currentMonthCoins: recharge.currentMonthCoins || 0,
        // currentMonthPaidAmount: recharge.currentMonthPaidAmount || 0,

        // previousMonthCoins: recharge.previousMonthCoins || 0,
        // previousMonthPaidAmount: recharge.previousMonthPaidAmount || 0,

        avgTransactionValueofprevAndToday: Number(avgTransactionValueTodayAndYesterday.toFixed(2)), // Combined Today & Yesterday avg value
        percentageChangePrevAndToday: Number(rechargePercentageChange.toFixed(2)) // Today vs Yesterday
      }
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};

module.exports = {
    getActiveTimeStats,
    CoinMangementDashboardStats
}