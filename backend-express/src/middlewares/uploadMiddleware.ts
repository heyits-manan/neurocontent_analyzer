import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs/promises";
import { Request } from "express";

const tmpDir = path.resolve(process.cwd(), "tmp");

const storage = multer.diskStorage({
  destination: async (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    await fs.mkdir(tmpDir, { recursive: true });
    cb(null, tmpDir);
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const extension = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, extension)
      .replace(/\s+/g, "-");
    const safeName = `${Date.now()}-${baseName}${extension}`;
    cb(null, safeName);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (!file.mimetype.startsWith("video/")) {
    cb(new Error("Only video files are allowed"));
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 500, // 500MB
  },
});
