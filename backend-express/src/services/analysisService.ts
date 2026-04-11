import axios, { AxiosError } from "axios";

/**
 * Fire-and-forget call to FastAPI /analyze.
 * FastAPI will download the video, run the pipeline, and write results
 * directly to Supabase. This function does not return results.
 */
export const triggerAnalysis = async (
  jobId: string,
  videoUrl: string
): Promise<void> => {
  const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000";

  try {
    await axios.post(
      `${fastApiUrl}/analyze`,
      { job_id: jobId, video_url: videoUrl },
      { timeout: 600000 }
    );
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const message =
        axiosError.response?.data?.detail ||
        axiosError.message ||
        "FastAPI analysis trigger failed";
      console.error(`Analysis trigger error for job ${jobId}: ${message}`);
    } else {
      console.error(
        `Analysis trigger error for job ${jobId}: ${error.message || "Unknown error"}`
      );
    }
    // Don't rethrow — caller handles with .catch()
    throw error;
  }
};
