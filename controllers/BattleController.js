const BaseController = require('../core/BaseController');
const Battle = require('../models/Battle');
const battleControlleradmin = new BaseController(Battle,{
    name:"Battle ",
    access:"admin",
    get:{
        populate:[{
            path:"hostA",
            select:"name avatar"
        },{
            path:"hostB",
            select:"name avatar"
        }],
        pre:async(filter,req)=>{
            filter.status = "live"
            return filter
        }
    },
    getById:{
        populate:[{path:"hostA",select:"name avatar"},{path:"hostB",select:"name avatar"},{path:"winner",select:"name avatar"}]
    }
})

module.exports = {battleControlleradmin};