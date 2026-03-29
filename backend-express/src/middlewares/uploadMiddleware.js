const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");

const uploadDir = process.env.UPLOAD_DIR || "uploads";

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const absoluteDir = path.resolve(process.cwd(), uploadDir);
    await fs.mkdir(absoluteDir, { recursive: true });
    cb(null, absoluteDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension).replace(/\s+/g, "-");
    const safeName = `${Date.now()}-${baseName}${extension}`;
    cb(null, safeName);
  }
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("video/")) {
    cb(new Error("Only video files are allowed"));
    return;
  }

  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 500
  }
});

