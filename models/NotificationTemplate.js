const mongoose = require('mongoose');
const NotificationTemplateSchema = new mongoose.Schema({
    templateName:{
        type:String,
        required:true
    },
    type:{
        type:String
    },
    category:{
        type:String
    },
    title:{
        type:String,
        required:true
    },
    message:{
        type:String
    },
    priority:{
        type:Number,
    },
    target:{
        type:String,
        enum: ["agency", "user", "businessDevelopment",'all'],
    }
},{timestamps:true});

module.exports = mongoose.model('NotificationTemplate',NotificationTemplateSchema)