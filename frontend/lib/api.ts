import { JobResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

export async function uploadVideo(file: File): Promise<{ job_id: string; status: string }> {
  const formData = new FormData();
  formData.append("video", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Upload failed");
  }

  return payload.data;
}

export async function processVideo(jobId: string): Promise<{ job_id: string; status: string }> {
  const response = await fetch(`${API_BASE_URL}/process/${jobId}`, {
    method: "POST"
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Processing failed");
  }

  return payload.data;
}

export async function getResults(jobId: string): Promise<JobResponse> {
  const response = await fetch(`${API_BASE_URL}/results/${jobId}`, {
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Failed to load results");
  }

  return payload.data;
}

/**
 * Poll the job status until it reaches a terminal state (completed or failed).
 * Returns the final job response.
 */
export async function pollJobStatus(
  jobId: string,
  intervalMs: number = 3000,
  maxAttempts: number = 200,
  onStatusChange?: (status: string) => void
): Promise<JobResponse> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await getResults(jobId);

    if (onStatusChange) {
      onStatusChange(result.status);
    }

    if (result.status === "completed" || result.status === "failed") {
      return result;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Polling timed out waiting for job completion");
}
