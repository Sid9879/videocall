const BaseController = require("../core/BaseController");
const Post = require("../models/Post");
const config = require("../config");

const postControllerUser = new BaseController(Post, {
  name: "Post",
  access: "user",
  accesskey: "userId",
  get: {
    pagination: config.pagination.app,
  },
});

//Public see all post of users
const postControllerPublic = new BaseController(Post, {
  name: "Post",
  get: {
    populate: [
      { path: "userId", select: "name avatar " },
      { path: "tag", select: "name avatar" },
    ],
    pre: async (filter, req) => {
      filter.isDeleted = false;
      return true;
    },
  },
  getById: {
    populate: [
      { path: "userId", select: "name avatar " },
      { path: "tag", select: "name avatar" },
    ],
  },
});

module.exports = {
  postControllerUser, // it used whom posted and he can see his post
  postControllerPublic, // used as public routes
};
