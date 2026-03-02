const mongoose = require('mongoose');
const ReportSchema = new mongoose.Schema({
    //the person who report
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    //Whom
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    category:{
        type:String,
        enum:['abuse','fakeProfile','payment','other','liveViolation'],
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["pending",'underReview','resolved'],
        default:"pending"
    },
},{timestamps:true});

module.exports = mongoose.model('Report',ReportSchema);