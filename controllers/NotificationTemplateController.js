const BaseController = require('../core/BaseController');
const NotificationTemplate = require('../models/NotificationTemplate');
const config = require('../config');

const notificationTemplateController = new BaseController(NotificationTemplate,{
    name:"Notification Template",
    access:'admin',
    get:{
        pagination:config.pagination.admin
    }
});


module.exports = notificationTemplateController;