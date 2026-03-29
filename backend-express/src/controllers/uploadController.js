const { createJob } = require("../services/jobService");
const { AppError } = require("../utils/AppError");

const uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError("Video file is required", 400);
    }

    const job = await createJob({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      videoPath: req.file.path
    });

    return res.status(201).json({
      success: true,
      data: {
        job_id: job.id,
        status: job.status,
        file_name: job.originalName
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadVideo
};

