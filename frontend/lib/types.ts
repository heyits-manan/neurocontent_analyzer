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
  video_path: string;
  audio_path: string;
  transcript: TranscriptSegment[];
  segments: SegmentAnalysis[];
  summary: string;
}

export interface JobResponse {
  job_id: string;
  status: "uploaded" | "processing" | "completed" | "failed";
  audio_path: string | null;
  video_filename: string;
  transcript: TranscriptSegment[];
  results: AnalysisResult | { segments: SegmentAnalysis[] };
  error: string | null;
}
