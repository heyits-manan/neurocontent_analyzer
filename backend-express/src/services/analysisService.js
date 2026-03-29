const axios = require("axios");

const { AppError } = require("../utils/AppError");

const analyzeVideo = async (videoPath) => {
  try {
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";
    const response = await axios.post(
      `${fastApiUrl}/analyze`,
      { video_path: videoPath },
      {
        timeout: 30000
      }
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "FastAPI analysis request failed";

    throw new AppError(message, 502);
  }
};

module.exports = {
  analyzeVideo
};

