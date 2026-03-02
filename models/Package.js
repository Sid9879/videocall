const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    packageName:{
        type:String,
        required:true
    },
    diamondAmount:{
        type:Number,
        required:true,
    },
    price:{
        type:Number,
        required:true
    },
    bonusDiamonds:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:["active","inactive"]
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

module.exports  =  mongoose.model('Package',PackageSchema);