const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messageType: {
        type: String,
        enum: ["text", "gift"],
        default: "text",
    },
    message: {
        type: String,
        // required: true
    },
    gift: {
    giftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gift",
    },
    name: String,
    icon: String,
    cost: Number,
    rarity: String,
  },
    isRead:{
        type: Boolean,
        default: false
    }
},{timestamps: true});

module.exports = mongoose.model('Chat', ChatSchema);