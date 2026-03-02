const BaseController = require('../core/BaseController');
const Banner = require('../models/Banner');
const config = require('../config');

const bannerController = new BaseController(Banner, {
  name: 'banner',
  access: 'Admin',
  get: {
    pagination: config.pagination,
  },
});

module.exports = {bannerController};