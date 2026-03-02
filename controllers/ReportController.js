const BaseController = require('../core/BaseController');
const Report = require('../models/Report');
const config = require('../config');

const reportControllerUser = new BaseController(Report,{
    name:"Report",
    access:"user",
    accessKey:"userId",
    get:{
        pagination:config.pagination.app
    }
});

//For Admin..
const reportControlleradmin = new BaseController(Report,{
    name:"Report",
    access:"admin",
    get:{
        pagination:config.pagination.app,
        populate:[{path:"userId",select:"name email mobile avatar"}]
    },
    getById:{
        pagination:config.pagination.app,
        populate:[{path:"userId",select:"name email mobile avatar"}]
    },
});


module.exports = {
    reportControllerUser,
    reportControlleradmin  
}