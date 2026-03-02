const BaseController  =  require("../core/BaseController");
const Review  =  require("../models/Review");
const config =  require("../config");
const User = require("../models/User");


const userReviewController = new BaseController(Review, {
  name: 'review',
  // access:'user',
  // accessKey:'user',
  get: {
    pagination: config.pagination,
    query: ["agency", "user"],
    populate: [
      { path: 'agency', select: 'name email phoneNo' },
      { path: 'user', select: 'name email phoneNo userImage' }
    ]
  },
});

const agencyReviewController = new BaseController(Review, {
  name: 'review',
  access:'user',
  accessKey:'agency',
  get: {
    pagination: config.pagination,
    query: ["agency", "user"],
    populate: [
    //   { path: 'agency', select: 'name email phoneNo' },
      { path: 'user', select: 'name email phoneNo userImage' }
    ],
    post: async (docs, req) => {
    const count = docs.length;

    const averageRating =
      count > 0
        ? docs.reduce((acc, cur) => acc + (cur.star || 0), 0) / count
        : 0;

    return {
      reviews: docs,
      // count: count,
      averageRating: Number(averageRating.toFixed(1)), 
    };
  },
  },
});






//  Add custom method
userReviewController.addRatingReview = async (req, res) => {
  try {
    const { agencyId, star, message } = req.body;
    let userId = req.user._id;

    if (!agencyId || !userId || !star) {
      return res.status(400).json({ error: 'agencyId, userId, and star are required' });
    }

    // 1. Check if user already reviewed this vendor
    const existingReview = await Review.findOne({ agency: agencyId, user: userId });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already given a review to this vendor.' });
    }

    // 2. Create new review
    const newReview = await Review.create({
      agency: agencyId,
      user: userId,
      star,
      message
    });

    // 3. Update vendor averageRating and count
    const reviews = await Review.find({ agency: agencyId });

    const count = reviews.length;
    const averageRating = reviews.reduce((acc, cur) => acc + cur.star, 0) / count;

    await User.findByIdAndUpdate(agencyId, {
      averageRating: averageRating.toFixed(1),
      count: count
    });

    res.status(201).json({
      message: 'Review added successfully',
      data: newReview
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong while adding review' });
  }
};



//Get reviews by agencyPartnerid
userReviewController.getMessagesWithUserName = async (req, res) => {
  try {
    const agencyId = req.params.id

  
    const reviews = await Review.find(
      { agency: agencyId },
      { message: 1, star: 1 }
    )
      .populate("user", "name _id avatar email") 
      .sort({ createdAt: -1 })
      .lean();

    const count = reviews.length;

  
    const averageRating =
      count > 0
        ? reviews.reduce((acc, cur) => acc + (cur.star || 0), 0) / count
        : 0;

    res.json({
      success: true,
      count,
      averageRating: Number(averageRating.toFixed(1)), 
      reviews: reviews.map((r) => ({
        star: r.star,
        message: r.message,
        ratedBy: r.user?.name,
        email: r.user?.email,
        avatar:r.user?.avatar,
        id: r._id,
      })),
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};




 
module.exports = {userReviewController, agencyReviewController}