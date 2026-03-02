const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const notificationRecipientController = require('../controllers/NotificationRecipientController');
const {conversionRateController} = require('../controllers/ConversioRateController');
const {agencyReviewController}    =  require("../controllers/ReviewController");

//Authentication
router.use(authController.authenticateToken);
router.use(authController.authorizeRole("agency"));


// notificationRecipient CRUD
router.get('/notificationRecipient', notificationRecipientController.get);
router.get('/notificationRecipient/:id', notificationRecipientController.getById)

//Conversion Rate
router.get('/conversion',conversionRateController.get);
router.get('/conversion/:id',conversionRateController.getById);

//Rating
router.get("/review" ,agencyReviewController.get);


module.exports = router