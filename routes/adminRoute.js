const express = require("express");
const router = express.Router();
const {
  rechargePlanControllerAdmin,
} = require("../controllers/RechargePlanController");
const { packageControlleradmin } = require("../controllers/PackageController");
const authController = require("../controllers/authController");
const { storeControlleradmin } = require("../controllers/StoreController");
const { vipTieradminController } = require("../controllers/VipTierController");
const { giftControlleradmin } = require("../controllers/GiftController");
const { bannerController } = require("../controllers/BannerController");
const { advertisementController } = require("../controllers/AdvertisementController");
const { feedbackControlleradmin } = require("../controllers/FeedbackController");
const { achievemeneControlleradmin } = require("../controllers/AchievemenetsController");
const { sponsorshipControlleradmin } = require("../controllers/SponsarshipController");
const notificationController = require('../controllers/NotificationController')
const roleController = require('../controllers/RoleController');
const {reportControlleradmin} = require('../controllers/ReportController');
const {supportControlleradmin} = require('../controllers/SupportController');
const {getLatestLogins} = require('../controllers/LoginHistoryController')
const {userController} = require('../controllers/UserController')
const {termAndPolicyControlleradmin} = require('../controllers/TermAndPolicyController');
const {conversionRateControlleradmin} = require('../controllers/ConversioRateController');
const notificationTemplateController = require('../controllers/NotificationTemplateController');
const {walletController} = require('../controllers/WalletController')
const {PurchaseControlleradmin} = require('../controllers/PurchaseController');
const {medalController} = require('../controllers/MedalController');
const {battleControlleradmin} = require('../controllers/BattleController');
const {CoinMangementDashboardStats} = require('../controllers/DashboardController');


//Authentication
router.use(authController.authenticateToken);
router.use(authController.authorizeRole("admin"));


//Get all user
router.get('/user',userController.get)
router.put('/user/:id',userController.updateById)

//Recharge Curd..........
router.get("/recharge", rechargePlanControllerAdmin.get);
router.get("/recharge/:id", rechargePlanControllerAdmin.getById);
router.post("/recharge", rechargePlanControllerAdmin.create);
router.put("/recharge/:id", rechargePlanControllerAdmin.updateById);
router.delete("/recharge/:id", rechargePlanControllerAdmin.deleteById);

//Top-Up Curd.......
router.get('/top-request',PurchaseControlleradmin.get)
router.get('/top-request/:id',PurchaseControlleradmin.getById)
router.put('/top-request/approve/:requestId',PurchaseControlleradmin.approvePurchase)
router.put('/top-request/reject/:requestId',PurchaseControlleradmin.rejectPurchase)

//Package Curd....
router.get("/package", packageControlleradmin.get);
router.get("/package/:id", packageControlleradmin.getById);
router.post("/package", packageControlleradmin.create);
router.put("/package/:id", packageControlleradmin.updateById);
router.delete("/package/:id", packageControlleradmin.deleteById);

//Store Curd..............
router.get("/store", storeControlleradmin.get);
router.get("/store/:id", storeControlleradmin.getById);
router.post("/store", storeControlleradmin.create);
router.put("/store/:id", storeControlleradmin.updateById);
router.delete("/store/:id", storeControlleradmin.deleteById);

//VIP TIER Curd............
router.get("/vip", vipTieradminController.get);
router.get("/vip/:id", vipTieradminController.getById);
router.post("/vip", vipTieradminController.create);
router.put("/vip/:id", vipTieradminController.updateById);
router.delete("/vip/:id", vipTieradminController.deleteById);

//Gift Curd..........
router.get("/gift", giftControlleradmin.get);
router.get("/gift/:id", giftControlleradmin.getById);
router.post("/gift", giftControlleradmin.create);
router.put("/gift/:id", giftControlleradmin.updateById);
router.delete("/gift/:id", giftControlleradmin.deleteById);

//Banner Curd.........
router.get("/banner", bannerController.get);
router.get("/banner/:id", bannerController.getById);
router.post("/banner", bannerController.create);
router.put("/banner/:id", bannerController.updateById);
router.delete("/banner/:id", bannerController.deleteById);


//Advertisement......
router.get("/advertisement", advertisementController.get);
router.get("/advertisement/:id", advertisementController.getById);
router.post("/advertisement", advertisementController.create);
router.put("/advertisement/:id", advertisementController.updateById);
router.delete("/advertisement/:id", advertisementController.deleteById);

// feedbackController curd
router.get("/feedback", feedbackControlleradmin.get);
router.get("/feedback/:id", feedbackControlleradmin.getById);
router.delete("/feedback/:id", feedbackControlleradmin.deleteById);

// AchievemeneController Curd ............
router.get("/achievements", achievemeneControlleradmin.get);
router.get("/achievements/:id", achievemeneControlleradmin.getById);
router.post("/achievements", achievemeneControlleradmin.create);
router.put("/achievements/:id", achievemeneControlleradmin.updateById);
router.delete("/achievements/:id", achievemeneControlleradmin.deleteById);



//Sponsorship Curd.......
router.get("/sponsorship", sponsorshipControlleradmin
.get);
router.get("/sponsorship/:id", sponsorshipControlleradmin
.getById);
router.post("/sponsorship", sponsorshipControlleradmin
.create);
router.put("/sponsorship/:id", sponsorshipControlleradmin
.updateById);
router.delete("/sponsorship/:id", sponsorshipControlleradmin
.deleteById);

//Notification Curd
router.get('/notification', notificationController.get);
router.get('/notification/:id', notificationController.getById);
router.post('/notification',  notificationController.createNotification);
router.put('/notification/:id',  notificationController.updateById);
router.delete('/notification/:id',  notificationController.deleteById);

// Role CRUD
router.get('/role', roleController.get);
router.get('/role/:id', roleController.getById);
router.post('/role',  roleController.create);
router.put('/role/:id',  roleController.updateById);
router.delete('/role/:id',  roleController.deleteById);


//Report Curd....
router.get("/report", reportControlleradmin.get);
router.get("/report/:id", reportControlleradmin.getById);
router.put("/report/:id", reportControlleradmin.updateById);
router.delete("/report/:id", reportControlleradmin.deleteById);



//Support
router.get("/support", supportControlleradmin.get);
router.get("/support/:id", supportControlleradmin.getById);
router.put("/support/:id", supportControlleradmin.updateById);
router.delete("/support/:id", supportControlleradmin.deleteById);

//latest login of users
router.get('/loginHistory',getLatestLogins)

//Term And Policy Curd.....
router.get('/term/policy',termAndPolicyControlleradmin.get);
router.get('/term/policy/:id',termAndPolicyControlleradmin.getById);
router.post('/term/policy',termAndPolicyControlleradmin.create);
router.put('/term/policy/:id',termAndPolicyControlleradmin.updateById);
router.delete('/term/policy/:id',termAndPolicyControlleradmin.deleteById);


//Conversion Rate Curd........
router.get('/conversion',conversionRateControlleradmin.get);
router.get('/conversion/:id',conversionRateControlleradmin.getById);
router.post('/conversion',conversionRateControlleradmin.create);
router.put('/conversion/:id',conversionRateControlleradmin.updateById);
router.delete('/conversion/:id',conversionRateControlleradmin.deleteById);


//notificationTemplate curd
router.get('/template',notificationTemplateController.get);
router.get('/template/:id',notificationTemplateController.getById);
router.post('/template',notificationTemplateController.create);
router.put('/template/:id',notificationTemplateController.updateById);
router.delete('/template/:id',notificationTemplateController.deleteById);

//Wallet Curd
router.get('/wallet',walletController.get);
router.get('/wallet/:id',walletController.getById);

//Medal Curd..
router.get('/medal',medalController.get);
router.get('/medal/:id',medalController.getById);
router.post('/medal',medalController.create);
router.put('/medal/:id',medalController.updateById);
router.delete('/medal/:id',medalController.deleteById);

//Battle Curd..
router.get('/battle',battleControlleradmin.get);
router.get('/battle/:id',battleControlleradmin.getById);


//Coin Management Panel Dashboard
router.get('/coin/dashboard',CoinMangementDashboardStats)
// router.get("/leaderboard/host", HostLeaderBoardController.getHostLeaderboard);
// router.get("/leaderboard/periodic", LeaderboardController.getPeriodicLeaderboard);

module.exports = router;
