//Report Submit by BD panel for host agency

const mongoose = require('mongoose');
const ReportSubmitSchema = new mongoose.Schema({
    reportType:{
        type:String,
        enum:['host','agency']
    },
    documentType:{
        type:String,
        enum:['pdf','excel'] // used if frontend not extract the doc.type by url
    },
    fileUrl:{
        type:String,
        required:true
    },
},{timestamps:true});

module.exports = mongoose.model("ReportSubmit",ReportSubmitSchema)