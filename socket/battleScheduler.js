const Battle = require("../models/Battle");

module.exports = function startBattleScheduler(io, activeBattles) {

  setInterval(async () => {
    try {

      const battleIds = Array.from(activeBattles.keys());
      if (battleIds.length === 0) return;

      const battles = await Battle.find({
        _id: { $in: battleIds },
        status: "live"
      });

      for (const battle of battles) {

        const timeOffset = Math.floor(
          (Date.now() - battle.startTime) / 1000
        );

        const snapshot = {
          time: timeOffset,
          hostAScore: battle.hostAScore,
          hostBScore: battle.hostBScore
        };

        await Battle.updateOne(
          { _id: battle._id },
          { $push: { scoreHistory: snapshot } }
        );

        io.to(battle._id.toString()).emit(
          "scoreHistoryUpdate",
          snapshot
        );

      }

    } catch (err) {
      console.error("Battle scheduler error:", err);
    }

  }, 300000); // 5 minutes

};