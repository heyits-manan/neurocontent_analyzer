import { Request, Response, NextFunction } from "express";
import { analyzeVideo } from "../services/analysisService";
import { getJobById, updateJob } from "../services/jobService";
import { AppError } from "../utils/AppError";

export const processJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobId = req.params.jobId as string;
    const job = await getJobById(jobId);

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    await updateJob(jobId, {
      status: "processing",
    });

    const analysis = await analyzeVideo(job.videoPath);

    const updatedJob = await updateJob(jobId, {
      status: "completed",
      audioPath: analysis.audio_path || null,
      transcript: analysis.transcript || [],
      results: analysis,
      error: null,
      processedAt: new Date().toISOString(),
    });

    if (updatedJob) {
      res.json({
        success: true,
        data: {
          job_id: updatedJob.id,
          status: updatedJob.status,
          audio_path: updatedJob.audioPath,
          transcript: updatedJob.transcript,
          results: updatedJob.results,
        },
      });
    }
  } catch (error: any) {
    if (req.params.jobId) {
      await updateJob(req.params.jobId as string, {
        status: "failed",
        error: error.message,
      }).catch(() => null);
    }

    next(error);
  }
};

export const getResults = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobId = req.params.jobId as string;
    const job = await getJobById(jobId);

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    res.json({
      success: true,
      data: {
        job_id: job.id,
        status: job.status,
        audio_path: job.audioPath || null,
        transcript: job.transcript || [],
        results: job.results || { segments: [] },
        error: job.error || null,
      },
    });
  } catch (error) {
    next(error);
  }
};
