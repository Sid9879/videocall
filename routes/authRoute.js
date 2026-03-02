const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


//For all role..
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify", authController.verifyOtp); 
router.post("/otp", authController.sendOtp)
router.put("/profile", authController.authenticateToken, authController.updateUser);
router.get("/profile", authController.authenticateToken, authController.getUser);
router.post("/forgot/password", authController.forgotPassword);
router.post("/reset/password", authController.resetPassword);



module.exports = router;