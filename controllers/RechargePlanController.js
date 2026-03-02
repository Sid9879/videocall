const BaseController = require("../core/BaseController");
const RechargePlan = require("../models/RechargePlan");
const config = require("../config");

const rechargePlanControllerAdmin = new BaseController(RechargePlan, {
  name: "Recharge Plan",
  access: "admin",
  create: {
    pre: async (body, req, res) => {
      const userId = req.user && req.user._id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized: user required" });
        return;
      }

      body.createdBy = userId;
    },
  },
});

const rechargePlanControllerallUser = new BaseController(RechargePlan, {
  name: "Recharge Plan",
  get: {
    pre: async (filter, req) => {
      filter.isActive = true;
      return true;
    },
  },
});

module.exports = { rechargePlanControllerAdmin, rechargePlanControllerallUser };
