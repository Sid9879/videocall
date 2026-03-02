const Achievement = require("../models/Achievement");
const UserAchievement = require("../models/UserAchievement");


// Call this after user signup
exports.initializeUserAchievements = async (userId) => {
  const achievements = await Achievement.find({ status: "active" });

  const records = achievements.map((a) => ({
    userId,
    achievementId: a._id,
    target: a.requirement.count,
  }));

  await UserAchievement.insertMany(records);
};



// const User = require("../models/User");
// const Achievement = require("../models/Achievement");

// Achievement Reward & Level Upgrade
exports.rewardAchievement = async (userId, achievementId) => {
  const achievement = await Achievement.findById(achievementId);
  const user = await User.findById(userId);

  if (!achievement || !user) return;

  user.xp += achievement.reward;

  while (user.xp >= user.nextLevelXp) {
    user.xp -= user.nextLevelXp;
    user.level += 1;
    user.nextLevelXp = Math.floor(user.nextLevelXp * 1.5);
  }

  await user.save();
};



// const UserAchievement = require("../models/UserAchievement");
// const { rewardAchievement } = require("./achievement.controller");


// COMPLETE Achievement Logic (ONLY ONCE)
exports.completeAchievement = async (userAchievement) => {
  if (userAchievement.status === "completed") return;

  userAchievement.status = "completed";
  userAchievement.unlockedAt = new Date();
  await userAchievement.save();

  await rewardAchievement(
    userAchievement.userId,
    userAchievement.achievementId
  );
};



const User = require("../models/User");
const UserAchievement = require("../models/UserAchievement");
const { completeAchievement } = require("./achievement.controller");

// Update Progress When USER ACTION Happens
exports.onUserFollowed = async (userId) => {
  const user = await User.findById(userId);
  user.followersCount += 1;
  await user.save();

  const achievements = await UserAchievement.find({
    userId,
    status: "in_progress",
  }).populate("achievementId");

  for (const ua of achievements) {
    if (ua.achievementId.requirement.type === "followers") {
      ua.progress += 1;

      if (ua.progress >= ua.target) {
        await completeAchievement(ua);
      } else {
        await ua.save();
      }
    }
  }
};





exports.getUserAchievements = async (req, res) => {
  const userId = req.user._id;

  const achievements = await UserAchievement.find({ userId })
    .populate("achievementId")
    .sort({ createdAt: 1 });

  res.json({
    success: true,
    data: achievements,
  });
};





// const Medal = require("../models/Medal");
// const UserMedal = require("../models/UserMedal");
// const UserAchievement = require("../models/UserAchievement");
// const User = require("../models/User");

exports.checkAndAwardMedal = async (userId) => {
  // count completed achievements
  const completedCount = await UserAchievement.countDocuments({
    userId,
    status: "completed",
  });

  const medals = await Medal.find({ status: "active" }).sort({
    requiredAchievements: 1,
  });

  for (const medal of medals) {
    const alreadyHas = await UserMedal.findOne({
      userId,
      medalId: medal._id,
    });

    if (!alreadyHas && completedCount >= medal.requiredAchievements) {
      // give medal
      await UserMedal.create({
        userId,
        medalId: medal._id,
      });

      // optional XP reward
      if (medal.rewardXp > 0) {
        const user = await User.findById(userId);
        user.xp += medal.rewardXp;
        await user.save();
      }
    }
  }
};




// const { checkAndAwardMedal } = require("./medal.controller");

exports.completeAchievement = async (userAchievement) => {
  if (userAchievement.status === "completed") return;

  userAchievement.status = "completed";
  userAchievement.unlockedAt = new Date();
  await userAchievement.save();

  await rewardAchievement(
    userAchievement.userId,
    userAchievement.achievementId
  );

  await checkAndAwardMedal(userAchievement.userId);
};
