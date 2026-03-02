const BaseController = require('../core/BaseController');
const ReportSubmit = require('../models/ReportSubmit');
const config = require('../config');

//For businessDevelopment
const reportSubmitByBD = new BaseController(ReportSubmit,{
    name:"Report",
    access:"businessDevelopment"
    
}); 



module.exports = {reportSubmitByBD};