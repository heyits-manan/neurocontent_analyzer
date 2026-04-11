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

export interface JobResponse {
  job_id: string;
  status: "uploaded" | "queued" | "processing" | "completed" | "failed";
  video_url: string | null;
  audio_url: string | null;
  original_name: string;
  transcript: TranscriptSegment[];
  results: AnalysisResult | { segments: SegmentAnalysis[]; summary?: string };
  error: string | null;
}
