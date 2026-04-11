"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { processVideo, uploadVideo, pollJobStatus } from "../lib/api";

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
      setStatus("Queuing analysis...");
      setIsProcessing(true);

      // Trigger processing (returns immediately with queued status)
      await processVideo(jobId);
      setStatus("Analysis queued. Waiting for results...");

      // Poll until completed or failed
      const finalResult = await pollJobStatus(jobId, 3000, 200, (jobStatus) => {
        if (jobStatus === "queued") {
          setStatus("Analysis queued. Waiting for processing to start...");
        } else if (jobStatus === "processing") {
          setStatus("Analysis in progress. This may take a few minutes...");
        }
      });

      if (finalResult.status === "completed") {
        setStatus("Processing complete. Redirecting to results...");
        router.push(`/results?jobId=${jobId}`);
      } else if (finalResult.status === "failed") {
        setError(finalResult.error || "Analysis failed");
        setStatus("");
      }
    } catch (processError: any) {
      setError(processError.message || "Processing error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-surface border border-border-card rounded-3xl p-6 md:p-8 shadow-custom backdrop-blur-md grid gap-4">
      <div>
        <label htmlFor="video-upload" className="font-semibold">Upload Video</label>
      </div>

      <input
        id="video-upload"
        className="w-full p-4 border border-dashed border-black/20 rounded-[20px] bg-surfacestrong font-inherit cursor-pointer"
        type="file"
        accept="video/*"
        onChange={(event) => {
          setSelectedFile(event.target.files?.[0] || null);
          setError("");
        }}
      />

      <div className="flex gap-3 flex-wrap">
        <button
          className="border-0 rounded-full px-5 py-3 cursor-pointer transition-all duration-200 hover:-translate-y-[1px] disabled:opacity-55 disabled:cursor-not-allowed bg-accent text-white font-inherit"
          onClick={handleUpload}
          disabled={isUploading}
          type="button"
        >
          {isUploading ? "Uploading..." : "Upload Video"}
        </button>

        <button
          className="border-0 rounded-full px-5 py-3 cursor-pointer transition-all duration-200 hover:-translate-y-[1px] disabled:opacity-55 disabled:cursor-not-allowed bg-[#ece2d6] text-textbody font-inherit"
          onClick={handleProcess}
          disabled={!jobId || isProcessing}
          type="button"
        >
          {isProcessing ? "Processing..." : "Process Analysis"}
        </button>
      </div>

      {jobId ? <div className="w-fit px-3 py-1.5 rounded-full bg-[#efe3d2] text-accentdark text-sm">Job ID: {jobId}</div> : null}
      {status ? <div className="rounded-2xl px-4 py-3 bg-[#2f7d5714] text-success leading-relaxed">{status}</div> : null}
      {error ? <div className="rounded-2xl px-4 py-3 bg-[#a436221a] text-[#8a281d] leading-relaxed">{error}</div> : null}
    </div>
  );
}
