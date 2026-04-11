import { Request, Response, NextFunction } from "express";
import { triggerAnalysis } from "../services/analysisService";
import { getJobById, updateJob } from "../services/jobService";
import { getVideoSignedUrl, getArtifactSignedUrl } from "../utils/storage";
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

    if (job.status !== "uploaded" && job.status !== "failed") {
      throw new AppError(
        `Job cannot be processed from status "${job.status}"`,
        409
      );
    }

    // Mark as queued
    await updateJob(jobId, { status: "queued" });

    // Generate a signed URL for the source video (1 hour expiry)
    const videoUrl = await getVideoSignedUrl(job.video_storage_path, 3600);

    // Fire-and-forget: trigger FastAPI analysis in the background
    triggerAnalysis(jobId, videoUrl).catch(async (err) => {
      const message =
        err instanceof Error
          ? err.message
          : "FastAPI analysis trigger failed";

      console.error(`Background analysis failed for job ${jobId}:`, err);

      try {
        await updateJob(jobId, {
          status: "failed",
          error: `Failed to start analysis: ${message}`,
        });
      } catch (updateError) {
        console.error(
          `Failed to mark job ${jobId} as failed after trigger error:`,
          updateError
        );
      }
    });

    res.json({
      success: true,
      data: {
        job_id: jobId,
        status: "queued",
      },
    });
  } catch (error) {
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

    // Generate signed URLs for media if available
    let videoUrl: string | null = null;
    let audioUrl: string | null = null;

    try {
      videoUrl = await getVideoSignedUrl(job.video_storage_path, 3600);
    } catch (_err) {
      console.warn(`Could not generate video signed URL for job ${jobId}`);
    }

    if (job.audio_storage_path) {
      try {
        audioUrl = await getArtifactSignedUrl(job.audio_storage_path, 3600);
      } catch (_err) {
        console.warn(`Could not generate audio signed URL for job ${jobId}`);
      }
    }

    res.json({
      success: true,
      data: {
        job_id: job.id,
        status: job.status,
        video_url: videoUrl,
        audio_url: audioUrl,
        original_name: job.original_name,
        transcript: job.transcript_json || [],
        results: job.results_json || { segments: [], summary: "" },
        error: job.error || null,
      },
    });
  } catch (error) {
    next(error);
  }
};
