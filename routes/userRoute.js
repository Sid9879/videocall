const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {bannerController} = require("../controllers/BannerController");
const { storeControlleradmin } = require("../controllers/StoreController");
const { feedbackController } = require("../controllers/FeedbackController");
const { advertisementControllerUser } = require("../controllers/AdvertisementController");
const {
  rechargePlanControllerallUser,
} = require("../controllers/RechargePlanController");

const {
  packageControllerUser,
} = require("../controllers/PackageController");

const { achievemeneControllerUser } = require("../controllers/AchievemenetsController");

const {postControllerUser} = require('../controllers/PostController');
const notificationRecipientController = require('../controllers/NotificationRecipientController');
const {reportControllerUser} = require('../controllers/ReportController');
const {supportControlleruser} = require('../controllers/SupportController');
const {conversionRateController} = require('../controllers/ConversioRateController');
const {userReviewController}    =  require("../controllers/ReviewController");
const {userController} = require('../controllers/UserController');
const {PurchaseController} = require('../controllers/PurchaseController')
const {getChatUsers, getChatMessages, sendChat} = require('../controllers/ChatController');
const {getTrendingPosts,postByFollowing,recordView,recordActiveTime} = require('../controllers/ActivityController')
const {getActiveTimeStats} = require('../controllers/DashboardController')
const { vipTieruserController } = require('../controllers/VipTierController');
const {giftControlleruser} = require('../controllers/GiftController');
const {purchaseStore} = require('../controllers/StoreController');
const {getHostLeaderboard} = require('../controllers/HostLeaderBoard');

//Authentication
router.use(authController.authenticateToken);
router.use(authController.authorizeRole(["user","host"]));

//Store Curd..............
router.get("/store", storeControlleradmin.get);
router.get("/store/:id", storeControlleradmin.getById);

//Purchase Store
router.post("/purchase/store", purchaseStore);

//Banner Curd.........
router.get("/banner", bannerController.get);
router.get("/banner/:id", bannerController.getById);



//Feedback Curd.........
router.post("/feedback", feedbackController.create);

//Advertisment
router.get("/advertisement", advertisementControllerUser.get);
router.get("/advertisement/:id", advertisementControllerUser.getById);


//Recharge Curd..........
router.get("/recharge", rechargePlanControllerallUser.get);
router.get("/recharge/:id", rechargePlanControllerallUser.getById);

//Top-Up request
router.get("/top-request", PurchaseController.get);
router.get("/top-request/:id", PurchaseController.getById);
router.post("/top-request", PurchaseController.create);


//Get Your Store Top..
router.get('/myStore',PurchaseController.getYourPurchaseStore)

//Package Curd....
router.get("/package", packageControllerUser.get);
router.get("/package/:id", packageControllerUser.getById);

//Achievements Curd....
router.get("/achievements", achievemeneControllerUser.get);
router.get("/achievements/:id", achievemeneControllerUser.getById);


//Post Curd....
router.get("/post", postControllerUser.get);
router.get("/post/:id", postControllerUser.getById);
router.post("/post", postControllerUser.create);
router.put("/post/:id", postControllerUser.updateById);
router.delete("/post/:id", postControllerUser.deleteById);


// notificationRecipient CRUD
router.get('/notificationRecipient', notificationRecipientController.get);
router.get('/notificationRecipient/:id', notificationRecipientController.getById);


//Report Curd....
router.post("/report", reportControllerUser.create);

//Support
router.post("/support", supportControlleruser.create);


//Conversion Rate
router.get('/conversion',conversionRateController.get);
router.get('/conversion/:id',conversionRateController.getById);


//Review
// router.get("/review" ,userReviewController.get);
router.get("/review/:id" ,userReviewController.getMessagesWithUserName);
router.post("/review" , userReviewController.addRatingReview);

//Delete Account Soft deletd
router.post('/delete/account',userController.deleteAccount)
router.get('/verifiedhost',userController.getVerifiedhost)

//Chat
router.get('/chat',getChatUsers)
router.get('/chat/messages/:receiverId',getChatMessages)
router.post('/chat',sendChat)

//Trending Posts
router.get('/trending',getTrendingPosts)
router.get('/post-by-following', postByFollowing)

//View Tracking
router.post('/view/:postId', recordView)

//Record Active Time
router.post('/active-time', recordActiveTime)

//Dashboard
router.get('/dashboard',getActiveTimeStats)

// VIP purchase
router.get('/vip-tier', vipTieruserController.get);
router.get('/vip-tier/:id', vipTieruserController.getById);
router.post('/vip-tier', vipTieruserController.buyVipTier);

//Gift Curd
router.get('/gift', giftControlleruser.get);
router.get('/gift/:id', giftControlleruser.getById);

//LeaderBoard......
router.get('/leaderboard', getHostLeaderboard);


module.exports = router;
