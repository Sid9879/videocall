const BaseController = require("../core/BaseController");
const Notification = require("../models/Notification");
const config = require("../config");
const User = require("../models/User");
const NotificationRecipient = require("../models/NotificationRecipient");
const mongoose = require('mongoose');

const notificationController = new BaseController(Notification, {
  name: "notification",
  access: "Admin",
  get: {
    pagination: config.pagination,
    searchFields: ['title', 'message']
  },
});

// Helper: normalize array of ids (strings or ObjectId) -> ObjectId[]
function toObjectIdArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v) => {
      try {
        return new mongoose.Types.ObjectId(v);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

// Helper: percent change if you need it later
function pct(cur, prev) {
  if (prev === 0) return cur === 0 ? 0 : 100;
  return ((cur - prev) / prev) * 100;
}

/**

Admin creates a notification (broadcast or targeted)

Body accepts:

{

title: string,

message: string,

scope: 'broadcast' | 'targeted', // default 'broadcast'

targetRole: 'vendor' | 'retailer' | 'all', // for broadcast (default 'all')

labels?: string[],

eventType?: 'SYSTEM' | 'ORDER_STATUS_CHANGED' | ...,

entityType?: 'NONE' | 'ORDER' | 'PRODUCT',

entityId?: string,

recipients?: string[] // required when scope='targeted'

}
*/
notificationController.createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      scope = "broadcast",
      targetRole = "all",
      labels = [],
      eventType = "SYSTEM",
      entityType = "NONE",
      entityId,
      recipients, // array of userIds if scope='targeted'
    } = req.body || {};

    if (!title || !message) {
      return res
        .status(400)
        .json({ message: "title and message are required" });
    }

    // Validate entityId requirement when entityType is not NONE
    let entityObjectId = undefined;
    if (entityType && entityType !== "NONE") {
      if (!entityId) {
        return res
          .status(400)
          .json({
            message: "entityId is required when entityType is not NONE",
          });
      }
      try {
        entityObjectId = new mongoose.Types.ObjectId(entityId);
      } catch {
        return res.status(400).json({ message: "Invalid entityId" });
      }
    }

    // Build Notification doc
    const notifDoc = {
      createdBy: req.user?._id, // optional
      title,
      message,
      scope,
      targetRole,
      labels: Array.isArray(labels) ? labels : [],
      eventType,
      entityType: entityType || "NONE",
      entityId: entityObjectId,
    };

    // Create Notification
    const notification = await Notification.create(notifDoc);

    // Determine recipients and create NotificationRecipient rows
    let recipientIds = [];

    if (scope === "broadcast") {
      // Find recipients by role
      let roleFilter = {};
      if (targetRole === "user") {
        roleFilter = { role: "user" };
      } else if (targetRole === "agency") {
        roleFilter = { role: "agency" };
      }else if (targetRole === "businessDevelopment") {
        roleFilter = { role: "businessDevelopment" };
      }else if (targetRole === "host") {
        roleFilter = { role: "host" };
      }
       else {
        roleFilter = { role: { $in: ["user", "agency", "businessDevelopment","host"] } };
      }
      const users = await User.find(roleFilter).select("_id").lean();
      recipientIds = users.map((u) => u._id);
    } else if (scope === "targeted") {
      // Use explicit list
      const ids = toObjectIdArray(recipients);
      if (!ids.length) {
        return res
          .status(400)
          .json({ message: "recipients array required for targeted scope" });
      }
      recipientIds = ids;
    } else {
      return res
        .status(400)
        .json({ message: "Invalid scope. Use broadcast or targeted." });
    }

    if (recipientIds.length) {
      // Prepare Recipient docs
      const docs = recipientIds.map((uid) => ({
        notification: notification._id,
        title:notification.title,
        message:notification.message,
        user: uid,
        labels: Array.isArray(labels) ? labels : [],
        isRead: false,
      }));

      // Insert recipients (ignore duplicates)
      try {
        await NotificationRecipient.insertMany(docs, { ordered: false });
      } catch (bulkErr) {
        // If there are duplicate key errors from unique index (user + notification), safe to ignore
        const dup = Array.isArray(bulkErr?.writeErrors)
          ? bulkErr.writeErrors.every((e) => e?.code === 11000)
          : false;
        if (!dup) {
          throw bulkErr;
        }
      }
    }

    return res.status(201).json({
      message: "Notification created successfully",
      data: notification,
      recipientsCount: recipientIds.length,
    });
  } catch (error) {
    console.error("createNotification error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**

Optional: Targeted helper for order status change (call from order workflow)

Body:

{

title,

message,

entityId: orderId,

recipients: [userIds]

}
*/
notificationController.notifyOrderStatusChange = async (req, res) => {
  try {
    const { title, message, entityId, recipients } = req.body || {};
    if (
      !title ||
      !message ||
      !entityId ||
      !Array.isArray(recipients) ||
      !recipients.length
    ) {
      return res
        .status(400)
        .json({
          message: "title, message, entityId, and recipients[] are required",
        });
    }

    const entityObjectId = new mongoose.Types.ObjectId(entityId);

    const notification = await Notification.create({
      createdBy: req.user?._id,
      title,
      message,
      scope: "targeted",
      targetRole: "all",
      eventType: "ORDER_STATUS_CHANGED",
      entityType: "ORDER",
      entityId: entityObjectId,
    });

    const ids = toObjectIdArray(recipients);
    const docs = ids.map((uid) => ({
      notification: notification._id,
      user: uid,
      isRead: false,
    }));

    if (docs.length) {
      await NotificationRecipient.insertMany(docs, { ordered: false });
    }

    return res.status(201).json({
      message: "Order status notifications created",
      data: notification,
      recipientsCount: docs.length,
    });
  } catch (error) {
    console.error("notifyOrderStatusChange error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = notificationController;