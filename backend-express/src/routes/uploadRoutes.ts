import express from "express";
import { uploadVideo } from "../controllers/uploadController";
import { upload } from "../middlewares/uploadMiddleware";

const router = express.Router();

router.post("/upload", upload.single("video"), uploadVideo);

export default router;
