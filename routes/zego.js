const express = require("express");
const router = express.Router();
const { getZegoToken } = require("../controllers/zego.controller");

router.post("/token", getZegoToken);

module.exports = router;