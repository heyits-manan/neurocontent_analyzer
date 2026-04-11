import express from "express";
import { uploadVideoHandler } from "../controllers/uploadController";
import { upload } from "../middlewares/uploadMiddleware";

const router = express.Router();

router.post("/upload", upload.single("video"), uploadVideoHandler);

export default router;
