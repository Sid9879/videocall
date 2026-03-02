const mongoose = require('mongoose');

const NotificationRecipientSchema = new mongoose.Schema({
  notification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
    required: false,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title:{
    type:String
  },
  message:{
    type:String
  },
  type:{
    type:String,
    enum:['info','success']
  },
  // read/unread state for this recipient
  isRead: { type: Boolean, default: false, index: true },
  readAt: { type: Date },

  // Delivery metadata (optional)
  deliveredAt: { type: Date, default: Date.now },
  // If you want per-user label overrides or inbox foldering later
  labels: { type: [String], default: [] }
}, { timestamps: true });

NotificationRecipientSchema.index({ user: 1, isRead: 1, createdAt: -1 });
NotificationRecipientSchema.index({ user: 1, notification: 1 }); // prevent duplicates

module.exports = mongoose.model('NotificationRecipient', NotificationRecipientSchema);