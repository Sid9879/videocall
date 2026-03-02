// controllers/zegoController.js
const generateZegoToken = require("../utility/generateZegoToken");

const getZegoToken = async (req, res) => {
  try {
    const { userID, roomID, publish, login, streamIDs } = req.body;

    const { token, expireAt } = await generateZegoToken({
      userID,
      roomID,
      publish,
      login,
      streamIDs
    });

    return res.json({ token, expireAt });

  } catch (error) {
    console.error("Token generation error:", error.message);
    return res.status(400).json({ error: error.message || "Failed to generate token" });
  }
};

module.exports = { getZegoToken };