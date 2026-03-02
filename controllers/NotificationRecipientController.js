const BaseController = require('../core/BaseController');
const NotificationRecipient = require('../models/NotificationRecipient');
const config = require('../config');
const mongoose = require('mongoose');

const notificationRecipientController = new BaseController(NotificationRecipient, {
  name: 'notificationRecipient',
  access: 'user',
  accessKey: 'user',
  get: {
    pagination: config.pagination,
    populate: [
      // { path: 'notification', select: 'title message' },
      { path: 'user'  ,select:"name email avatar" }
    ],
    query:["user", "isRead"],
  },
});

notificationRecipientController.getUserNotifications = async function(req, res) {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized: user id required' });

    // Base match: current user
    const match = { user: new mongoose.Types.ObjectId(userId) };

    // Optional isRead filter (true/false)
    if (req.query.isRead !== undefined && req.query.isRead !== '') {
      const v = req.query.isRead;
      match.isRead = (v === true || v === 'true' || v === '1' || v === 1);
    }

    // Pagination
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
    const skip = (page - 1) * limit;

    // Build search match for notification.title (partial, case-insensitive)
    let searchMatch = null;
    if (req.query.search) {
      const term = String(req.query.search).trim();
      if (term) {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const rx = new RegExp(escaped, 'i');
        searchMatch = { 'notification.title': { $regex: rx } };
      }
    }

    // Pipeline
    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'notifications',
          localField: 'notification',
          foreignField: '_id',
          as: 'notification'
        }
      },
      { $unwind: { path: '$notification', preserveNullAndEmptyArrays: false } },
    ];

    if (searchMatch) pipeline.push({ $match: searchMatch });

    pipeline.push(
      {
        $project: {
          notification: { _id: 1, title: 1, message: 1 },
          user: 1,
          isRead: 1,
          labels: 1,
          deliveredAt: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    // Count with same filters (no pagination)
    const countPipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'notifications',
          localField: 'notification',
          foreignField: '_id',
          as: 'notification'
        }
      },
      { $unwind: { path: '$notification', preserveNullAndEmptyArrays: false } },
    ];
    if (searchMatch) countPipeline.push({ $match: searchMatch });
    countPipeline.push({ $count: 'count' });

    const [data, countAgg] = await Promise.all([
      NotificationRecipient.aggregate(pipeline),
      NotificationRecipient.aggregate(countPipeline)
    ]);

    const count = countAgg?.[0]?.count || 0;

    return res.status(200).json({
      message: 'notificationRecipient fetched successfully',
      page,
      limit,
      count,
      data
    });
  } catch (error) {
    console.error('getUserNotifications error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

module.exports = notificationRecipientController;