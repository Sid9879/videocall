const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {postControllerPublic} = require('../controllers/PostController')
const {toggleLike,getlikeByPost} = require('../controllers/LikeController');
const {addComment,deleteComment,getComments,getReplies,editComment} = require('../controllers/CommentController');

const {toggleFollowAndUnfollow,getFollowers,getFollowing} = require('../controllers/FollwerAndFollowingController')
const {termAndPolicyController} = require('../controllers/TermAndPolicyController');
const {recordView} = require('../controllers/ActivityController')

//Authentication
router.use(authController.authenticateToken);
// router.use(authController.authorizeRole("businessDevelopment"));

router.get('/post',postControllerPublic.get);
router.get('/post/:id',postControllerPublic.getById);

//Like;
router.get('/like/:postId',getlikeByPost);
router.post('/like/:postId',toggleLike);

//Comments..
router.get('/comment/:postId',getComments);
router.get('/comment/replies/:commentId',getReplies);
router.post('/comment/:postId',addComment);
router.put('/comment/:commentId',editComment);
router.delete('/comment/:commentId',deleteComment);


//Follwers and Following
router.get('/followers/:userId',getFollowers);
router.get('/following/:userId',getFollowing);
router.post('/follow/:userId',toggleFollowAndUnfollow);//work follow and following


//Term And Policy Curd.....
router.get('/term/policy',termAndPolicyController.get);
router.get('/term/policy/:id',termAndPolicyController.getById);

//View Tracking
router.post('/view/:postId', recordView)


module.exports = router;
