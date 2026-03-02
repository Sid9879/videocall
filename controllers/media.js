const express = require("express");
const router = express.Router();
const Image = require("../models/Image");
const ImageWordPressController = require("../core/ImageWordPressController");
const BaseController = require("../core/BaseController");
const config = require("../config");
const auth = require("../controllers/authController");

const authenticateToken = auth.authenticateToken;
// const authoriseAdmin = auth.authorizeRole(['agent', 'admin']);

// const mediaController = new ImageCloudflareController(Image, {
//     cloudflare: config.cloudflareImage,
//     rootAccessRoles: ["admin"],
//     pagination: config.pagination
// });

const mediaController = new ImageWordPressController(Image, {
  wordpress: config.wordpress,
  quality: { sharpQuality: 80 },
  rootAccessRoles: ["admin"],
});

const publicImageController = new BaseController(Image, {
  access: "admin",
  get: {
    pagination: config.pagination,
    pre: (filter, req, res) => {
      if (!(req.user.role == "admin" || req.user.role == "editor")) {
        filter.createdBy = req.user._id;
        filter.public = true;
      }
    },
    sort: { createdAt: -1 },
  },
});

const privateImageController = new BaseController(Image, {
  access: "user",
  accessKey: "createdBy",
  get: {
    pagination: config.pagination,
    sort: { createdAt: -1 },
  },
});

// routes/media.js
// router.post('/', authenticateToken, mediaController.uploadImage);
// router.post('/bulk', authenticateToken, mediaController.uploadBulkImages);
// router.delete('/:id', authenticateToken, mediaController.deleteImage);

// router.get('/', authenticateToken, privateImageController.get);
// router.get('/public', authenticateToken, publicImageController.get);

// router.put('/:id', authenticateToken, publicImageController.updateById);

router.post("/", authenticateToken, mediaController.uploadImage);
router.post("/public", mediaController.uploadImage);

router.get("/", authenticateToken, privateImageController.get);
router.get("/public", authenticateToken, publicImageController.get);
router.delete("/:id", authenticateToken, mediaController.deleteImage);

router.put("/:id", authenticateToken, mediaController.updateImageFile);

module.exports = router;
