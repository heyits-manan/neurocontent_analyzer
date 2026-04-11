import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { createJob } from "../services/jobService";
import { uploadVideo, deleteTempFile } from "../utils/storage";
import { AppError } from "../utils/AppError";

export const uploadVideoHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError("Video file is required", 400);
    }

    const tempFilePath = req.file.path;

    // Build a deterministic storage path
    const jobId = uuidv4();
    const extension = path.extname(req.file.originalname);
    const baseName = path
      .basename(req.file.originalname, extension)
      .replace(/\s+/g, "-");
    const safeFilename = `${Date.now()}-${baseName}${extension}`;
    const storagePath = `${jobId}/${safeFilename}`;

    // Upload to Supabase Storage (videos bucket)
    await uploadVideo(storagePath, tempFilePath, req.file.mimetype);

    // Create job row in Postgres (pass the pre-generated ID)
    const job = await createJob({
      id: jobId,
      video_storage_path: storagePath,
      original_name: req.file.originalname,
      mime_type: req.file.mimetype,
      size_bytes: req.file.size,
    });

    // Delete local temp file
    await deleteTempFile(tempFilePath);

    res.status(201).json({
      success: true,
      data: {
        job_id: job.id,
        status: job.status,
        file_name: job.original_name,
      },
    });
  } catch (error) {
    // Best-effort cleanup of temp file on error
    if (req.file?.path) {
      await deleteTempFile(req.file.path);
    }
    next(error);
  }
};
