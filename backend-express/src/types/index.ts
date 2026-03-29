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
}

export interface AnalysisResult {
  video_path: string;
  audio_path: string;
  transcript: TranscriptSegment[];
  segments: SegmentAnalysis[];
  summary: string;
}

export interface Job {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  videoPath: string;
  audioPath: string | null;
  status: "uploaded" | "processing" | "completed" | "failed";
  transcript: TranscriptSegment[];
  results: AnalysisResult | null;
  error: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface CreateJobInput {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  videoPath: string;
}

export type JobStore = Record<string, Job>;
