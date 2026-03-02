const mongoose = require('mongoose');

const GiftSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    icon:{
        type:String,
        required:true
    },
    cost:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    rarity:{
        type:String,
        enum:["common","rare","epic","legendary"],
        required:true
    },
    status:{
        type:String,
        enum:['regular',"limited"]
    }
},{timestamps:true});

module.exports = mongoose.model('Gift',GiftSchema);