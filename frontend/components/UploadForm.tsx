"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { processVideo, uploadVideo } from "../lib/api";

export default function UploadForm() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Select a video file first.");
      return;
    }

    try {
      setError("");
      setStatus("Uploading video...");
      setIsUploading(true);
      const uploadResponse = await uploadVideo(selectedFile);
      setJobId(uploadResponse.job_id);
      setStatus(`Upload complete. Job created: ${uploadResponse.job_id}`);
    } catch (uploadError: any) {
      setError(uploadError.message || "Upload error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleProcess = async () => {
    if (!jobId) {
      setError("Upload a file before processing.");
      return;
    }

    try {
      setError("");
      setStatus("Processing analysis...");
      setIsProcessing(true);
      await processVideo(jobId);
      setStatus("Processing complete. Redirecting to results...");
      router.push(`/results?jobId=${jobId}`);
    } catch (processError: any) {
      setError(processError.message || "Processing error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="card upload-panel">
      <div>
        <label htmlFor="video-upload">Upload Video</label>
      </div>

      <input
        id="video-upload"
        className="file-input"
        type="file"
        accept="video/*"
        onChange={(event) => {
          setSelectedFile(event.target.files?.[0] || null);
          setError("");
        }}
      />

      <div className="actions">
        <button
          className="button button-primary"
          onClick={handleUpload}
          disabled={isUploading}
          type="button"
        >
          {isUploading ? "Uploading..." : "Upload Video"}
        </button>

        <button
          className="button button-secondary"
          onClick={handleProcess}
          disabled={!jobId || isProcessing}
          type="button"
        >
          {isProcessing ? "Processing..." : "Process Analysis"}
        </button>
      </div>

      {jobId ? <div className="pill">Job ID: {jobId}</div> : null}
      {status ? <div className="status-box">{status}</div> : null}
      {error ? <div className="error-box">{error}</div> : null}
    </div>
  );
}
