const mongoose = require('mongoose');
const TermAndPolicyScheme = new mongoose.Schema({
    type:{
        type:String,
        enum:['termsAndconditions','privacyPolicy',"communityGuidelines"]
    },
    pdf:{
        type:String,
        required:true
    },
    fileUrl:{
        type:String,
        required:true
    },
    guidelines:[{
        type:String
    }],

},{timestamps:true});

TermAndPolicyScheme.index({type:1});
module.exports = mongoose.model('TermAndPolicy',TermAndPolicyScheme);