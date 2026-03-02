const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  // Who authored/created the notification (superadmin or system)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Superadmin or system user
    required: false
  },

  // Basic content
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },

  // Audience scope
  // broadcast: send to a role audience (vendor / retailer)
  // targeted: send to explicit user(s) (e.g., order events)
  scope: {
    type: String,
    enum: ['broadcast', 'targeted'],
    default: 'broadcast',
    index: true
  },

  // When broadcast, the target role(s)
  targetRole: {
    type: String,
   enum: ["agency", "user", "businessDevelopment",'all',"host"],
    default: 'all',
    index: true
  },

  // Optional labels/tags for UI (e.g., Primary/Work/Friends/Social)
  labels: {
    type: [String],
    default: []
  },

  // Event context (optional, for deep links)
  // e.g., order status changed
  eventType: {
    type: String,
    enum: [
      'SYSTEM',
      'ORDER_CREATED',
      'ORDER_CONFIRMED',
      'ORDER_SHIPPED',
      'ORDER_DELIVERED',
      'ORDER_CANCELLED',
      'ORDER_STATUS_CHANGED',
      'PRODUCT_APPROVED',
      'PRODUCT_REJECTED'
    ],
    default: 'SYSTEM',
    index: true
  },

  // Deep-link context so client can navigate
  entityType: {
    type: String,
    enum: ['ORDER', 'PRODUCT', 'NONE'],
    default: 'NONE',
    index: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function () { return this.entityType && this.entityType !== 'NONE'; }
  },

  // Soft flags
  isActive: { type: Boolean, default: true },      // allow disabling old notifications
  isSticky: { type: Boolean, default: false }      // pin/highlight in UI (optional)
}, { timestamps: true });

NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ targetRole: 1, createdAt: -1 });
NotificationSchema.index({ eventType: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);