import axios, { AxiosError } from "axios";
import { AppError } from "../utils/AppError";
import { AnalysisResult } from "../types";

export const analyzeVideo = async (
  videoPath: string
): Promise<AnalysisResult> => {
  try {
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";
    const response = await axios.post<AnalysisResult>(
      `${fastApiUrl}/analyze`,
      { video_path: videoPath },
      {
        timeout: 300000,
      }
    );

    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const message =
        axiosError.response?.data?.detail ||
        axiosError.message ||
        "FastAPI analysis request failed";
      throw new AppError(message, 502);
    }

    throw new AppError(error.message || "Unknown error", 502);
  }
};
