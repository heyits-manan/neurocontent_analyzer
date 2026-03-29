const express = require("express");

const uploadController = require("../controllers/uploadController");
const uploadMiddleware = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/upload", uploadMiddleware.single("video"), uploadController.uploadVideo);

module.exports = router;

