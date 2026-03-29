const { analyzeVideo } = require("../services/analysisService");
const { getJobById, updateJob } = require("../services/jobService");
const { AppError } = require("../utils/AppError");

const processJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId;
    const job = await getJobById(jobId);

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    await updateJob(jobId, {
      status: "processing"
    });

    const analysis = await analyzeVideo(job.videoPath);

    const updatedJob = await updateJob(jobId, {
      status: "completed",
      results: analysis,
      processedAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      data: {
        job_id: updatedJob.id,
        status: updatedJob.status,
        results: updatedJob.results
      }
    });
  } catch (error) {
    if (req.params.jobId) {
      await updateJob(req.params.jobId, {
        status: "failed",
        error: error.message
      }).catch(() => null);
    }

    return next(error);
  }
};

const getResults = async (req, res, next) => {
  try {
    const job = await getJobById(req.params.jobId);

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    return res.json({
      success: true,
      data: {
        job_id: job.id,
        status: job.status,
        results: job.results || { segments: [] },
        error: job.error || null
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  processJob,
  getResults
};

