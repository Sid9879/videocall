const BaseController = require("../core/BaseController");
const Gift = require("../models/Gift");
const config = require("../config");

const giftControlleradmin = new BaseController(Gift, {
  name: "Gift",
  access: "admin",
  get:{
    pagination:config.pagination.admin
  }
  //   create: {
  //     pre: async (body, req, res) => {
  //       const userId = req.user._id;
  //       if (!userId) {
  //         return res.status(403).json({ message: "Unauthorized" });
  //       }
  //       body.createdBy = userId;
  //     },
  //   },
});


//User
const giftControlleruser = new BaseController(Gift,{
  name:"Gift",
  get:{
    pagination:config.pagination.app
  }
});

module.exports = { giftControlleradmin,giftControlleruser};
