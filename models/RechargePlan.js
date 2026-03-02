const mongoose = require('mongoose');

const RechargePlanSchema = new mongoose.Schema({
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    amount:{
        type:Number,
        required:true
    },
    coinValue:{
        type:Number,
        required:true
    },
    bonusCoins:{
        type:Number,
        required:true
    },
    isPopular:{
        type:Boolean,
        default:false
    },
    isActive:{
        type:Boolean,
        default:true
    }
    
},{timestamps:true});

module.exports = mongoose.model("RechargePlan",RechargePlanSchema);