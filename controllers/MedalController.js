const BaseController = require('../core/BaseController');
const Medal = require('../models/Medal');
const config = require('../config');

const medalController = new BaseController(Medal,{
    name:"Medal",
    access:"admin",
    create:{
        pre:async(playload,req,res)=>{
            playload.createdBy = req.user._id;
        }
    }
});

//User can only view medals
const medalControllerUser = new BaseController(Medal,{
    name:"Medal",
});

module.exports = {
    medalController,
    medalControllerUser
}