const BaseController = require('../core/BaseController');
const Support = require('../models/Support');
const config = require('../config');

const supportControlleruser = new BaseController(Support,{
    name:"Support",
    access:"user",
    accesskey:"userId"
});

const supportControlleradmin = new BaseController(Support,{
    name:"Support",
    access:"admin",
});

module.exports = {
    supportControlleruser,
    supportControlleradmin
}