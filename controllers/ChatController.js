const Chat = require('../models/Chat');
const mongoose = require('mongoose');
const config=require("../config")
const { pagination } = require('../utility/pagination');

// Get chat users based on role
const getChatUsers = async (req, res) => {
    try {
        const currentUserId = req.user._id; // logged-in user ID

        const chatList = await Chat.aggregate([
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(currentUserId) },
                        { receiver: new mongoose.Types.ObjectId(currentUserId) }
                    ]
                }
            },

            {
                $addFields: {
                    otherUser: {
                        $cond: [
                            { $eq: ["$sender", new mongoose.Types.ObjectId(currentUserId)] },
                            "$receiver",
                            "$sender"
                        ]
                    }
                }
            },

            {
                $group: {
                    _id: "$otherUser",

                    lastMessage: { $last: "$message" },
                    time: { $last: "$createdAt" },

                    unreadMessageCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$receiver", new mongoose.Types.ObjectId(currentUserId)] },
                                        { $eq: ["$isRead", false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },

            { $unwind: "$user" },

            {
                $project: {
                    _id: 0,
                    userId: "$user._id",
                    fullName: "$user.fullName",
                    status: "$user.status",
                    userImage: "$user.userImage",
                    subscription: "$user.subscription.status",
                    lastMessage: 1,
                    time: 1,
                    unreadMessageCount: 1
                }
            },

            { $sort: { time: -1 } }
        ]);

        return res.status(200).json({
            message: "Chat list fetched successfully",
            data: chatList
        });

    } catch (error) {
        console.error("Error fetching chat list:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch chat list",
            error: error.message
        });
    }
};


// Get chat history between two users
const getChatMessages = async (req, res) => {
    try {
        const { receiverId } = req.params;
        const senderId = req.user._id;

        let { limit, skip } = pagination(req);

        // Mark messages as read
        await Chat.updateMany(
            { sender: receiverId, receiver: senderId, isRead: false },
            { $set: { isRead: true } }
        );

        const chatHistory = await Chat.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        }).sort({ createdAt: 1 })
        //.limit(limit);

        const count = await Chat.countDocuments({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });

        return res.status(200).json({
            message: 'Chat history fetched successfully',
            count,
            data: chatHistory
        });

    } catch (error) {
        console.error('Error in getChatHistory:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};


const sendChat = async (req, res) => {
    try {
        const { receiverId ,message} = req.body;
        const senderId = req.user._id;


        const chat = await Chat.create({
            sender: senderId,
            receiver: receiverId,
            message
        });

        return res.status(200).json({
            message: "Message sent successfully",
            data: chat
        });
    } catch (error) {
        console.error('Error in sendChat:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};







module.exports = { getChatUsers, getChatMessages, sendChat };