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

export async function processVideo(jobId: string): Promise<JobResponse> {
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
    next: { tags: ["results"] }
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Failed to load results");
  }

  return payload.data;
}
