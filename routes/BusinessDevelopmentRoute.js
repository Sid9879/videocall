const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { reportSubmitByBD } = require("../controllers/ReportSubmitController");
const notificationRecipientController = require('../controllers/NotificationRecipientController');
const {userController} = require('../controllers/UserController');

//Authentication
router.use(authController.authenticateToken);
router.use(authController.authorizeRole("businessDevelopment"));

//User Curd..
router.get('/user',userController.get)
router.put('/user/:id',userController.updateById)

//Banner Curd.........
router.get("/report", reportSubmitByBD.get);
router.get("/report/:id", reportSubmitByBD.getById);
router.post("/report", reportSubmitByBD.create);
router.put("/report/:id", reportSubmitByBD.updateById);
router.delete("/report/:id", reportSubmitByBD.deleteById);


// notificationRecipient CRUD
router.get('/notificationRecipient', notificationRecipientController.get);
router.get('/notificationRecipient/:id', notificationRecipientController.getById)




module.exports = router;
