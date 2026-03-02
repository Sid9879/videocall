const BaseController = require('../core/BaseController');
const Role = require('../models/Role');
const config = require('../config');

const roleController = new BaseController(Role, {
  name: 'role',
  access: 'user',
  accessKey: 'createdBy',
  get: {
    pagination: config.pagination,
    query:["panel", "createdBy"],
    searchFields: ['role']
  },
  
  create: {
    pre: async (body, req, res) => {
      if (!req.user || !req.user._id) {
        throw new Error("Unauthorized: Missing user info");
      }
     
      body.createdBy = req.user._id;
    },
  },
});

module.exports = roleController;