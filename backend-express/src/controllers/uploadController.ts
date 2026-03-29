import { Request, Response, NextFunction } from "express";
import { createJob } from "../services/jobService";
import { AppError } from "../utils/AppError";

export const uploadVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError("Video file is required", 400);
    }

    const job = await createJob({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      videoPath: req.file.path,
    });

    res.status(201).json({
      success: true,
      data: {
        job_id: job.id,
        status: job.status,
        file_name: job.originalName,
      },
    });
  } catch (error) {
    next(error);
  }
};
