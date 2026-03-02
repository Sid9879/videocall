const BaseController = require("../core/BaseController");
const FeedBack = require("../models/FeedBack");

const feedbackController = new BaseController(FeedBack, {
  name: "FeedBack",
  access: "user",
  accesskey: "userId",
});

const feedbackControlleradmin = new BaseController(FeedBack, {
  name: "FeedBack",
  access: "admin",
});

module.exports = {
  feedbackController,
  feedbackControlleradmin,
};
