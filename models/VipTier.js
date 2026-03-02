const mongoose = require('mongoose');

const VipTierSchema = new mongoose.Schema({
    tierName:{
        type:String,
        required:true
    },
    level:{
        type:Number,
    },
    price:{
        type:Number
    },
    duration:{
        type:Number  //Store no. of days
    },
    badgeIcon:{
        type:String,
    },
    benefits:{
        type:String
    }
},{timestamps:true});

module.exports = mongoose.model('VIPTIER',VipTierSchema);