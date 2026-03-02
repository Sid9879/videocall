// const jwt = require("jsonwebtoken");
// const { generateToken04 } = require("./zegoServerAssistant"); // Zego helper
// const config = require("../config");

// exports.getZegoToken = (req, res) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "Unauthorized" });

//     const decoded = jwt.verify(token, config.jwtSecret.jwtSecret);

//     const userId = decoded._id.toString();
//     const roomId = req.body.roomId;

//     const appId = config.zego.appId;
//     const serverSecret = config.zego.serverSecret;
//     const expireInSeconds = 3600;

//     const zegoToken = generateToken04(
//       appId,
//       userId,
//       serverSecret,
//       expireInSeconds,
//       roomId
//     );

//     res.json({
//       token: zegoToken,
//       userId,
//       roomId
//     });

//   } catch (err) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };



const { generateToken04 } = require("./zego_server_assistant"); // from local file

/**
 * Generate a ZEGOCLOUD Token
 * @param {string} userID - Unique user identifier
 * @param {string} roomID - Room identifier
 * @param {boolean} canPublish - Permission to publish stream
 * @param {boolean} canLogin - Permission to login to room
 * @param {array} streamIDs - Allowed stream IDs
 * @returns {string} token
 */
const createZegoToken = (userID, roomID, canPublish = true, canLogin = true, streamIDs = []) => {
    const appID = Number(process.env.ZEGO_APP_ID);
    const serverSecret = process.env.ZEGO_SERVER_SECRET;
    const effectiveTimeInSeconds = Number(process.env.TOKEN_TTL || 3600);

    // Privilege payload
    const payload = {
        room_id: roomID,
        privilege: {
            1: canLogin ? 1 : 0,  // login room
            2: canPublish ? 1 : 0 // publish stream
        },
        stream_id_list: streamIDs
    };

    return generateToken04(appID, userID, serverSecret, effectiveTimeInSeconds, JSON.stringify(payload));
};

module.exports = { createZegoToken };