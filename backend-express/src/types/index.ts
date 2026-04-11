export interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
}

export interface SegmentAnalysis {
  start: number;
  end: number;
  load: string;
  attention: string;
  issue: string;
  suggestion: string;
  reason?: string;
  rewrite?: string;
}

export interface AnalysisResult {
  transcript: TranscriptSegment[];
  segments: SegmentAnalysis[];
  summary: string;
}

export type JobStatus =
  | "uploaded"
  | "queued"
  | "processing"
  | "completed"
  | "failed";

export interface Job {
  id: string;
  status: JobStatus;
  video_storage_path: string;
  audio_storage_path: string | null;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  transcript_json: TranscriptSegment[] | null;
  results_json: AnalysisResult | null;
  error: string | null;
  created_at: string;
  updated_at: string;
  processed_at: string | null;
}

export interface CreateJobInput {
  id?: string;
  video_storage_path: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
}
