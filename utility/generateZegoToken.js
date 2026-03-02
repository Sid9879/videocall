// utils/generateZegoToken.js
const { createZegoToken } = require("./zegoToken");

const SAFE_ID = /^[A-Za-z0-9_]{1,64}$/;

/**
 * Async function to generate a Zego token safely
 * @param {Object} params
 * @param {string} params.userID - The user ID (alphanumeric, max 64 chars)
 * @param {string} params.roomID - The room ID (alphanumeric, max 64 chars)
 * @param {boolean} [params.publish=true] - Whether user can publish stream
 * @param {boolean} [params.login=true] - Whether user can login to room
 * @param {string[]} [params.streamIDs=[]] - Optional stream IDs
 * @returns {Promise<Object>} - { token, expireAt }
 * @throws {Error} - If validation fails or token generation fails
 */
async function generateZegoToken({ userID, roomID, publish = true, login = true, streamIDs = [] }) {
  if (!SAFE_ID.test(userID) || !SAFE_ID.test(roomID)) {
    throw new Error("Invalid userID or roomID format");
  }

  // If createZegoToken ever becomes async (API call), await will handle it
  const token = await Promise.resolve(createZegoToken(userID, roomID, publish, login, streamIDs));
  const expireAt = Math.floor(Date.now() / 1000) + Number(process.env.TOKEN_TTL || 3600);

  return { token, expireAt };
}

module.exports = generateZegoToken;