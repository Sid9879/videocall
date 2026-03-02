const BaseController = require("../core/BaseController");
const Package = require("../models/Package");
const config = require("../config");

const packageControlleradmin = new BaseController(Package, {
  name: "Package",
  access: "admin",
  create: {
    pre: async (body, req, res) => {
      const userId = req.user._id;
      if (!userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      body.createdBy = userId;
    },
  },
});

//For User
const packageControllerUser = new BaseController(Package, {
  name: "Package",
});

module.exports = { packageControlleradmin ,packageControllerUser};
