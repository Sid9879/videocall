const BaseController = require('../core/BaseController');
const Advertisement = require('../models/Advertisement');
const config = require('../config');


const advertisementController = new BaseController(Advertisement,{
    name:"Advertisement",
    access:"admin"
});


const advertisementControllerUser = new BaseController(Advertisement,{
    name:"Advertisement",
    // access:"user"
});

module.exports = {
    advertisementController,
    advertisementControllerUser
}