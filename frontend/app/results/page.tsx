import Link from "next/link";
import InteractiveViewer from "../../components/InteractiveViewer";
import { getResults } from "../../lib/api";
import { JobResponse, TranscriptSegment, SegmentAnalysis } from "../../lib/types";

export default async function ResultsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const jobId = searchParams?.jobId as string | undefined;

  if (!jobId) {
    return (
      <main className="page-shell">
        <div className="card">
          <p>Missing job ID. Upload and process a video first.</p>
          <Link className="button button-secondary" href="/">
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  let resultData: JobResponse | null = null;
  let errorMessage = "";

  try {
    resultData = await getResults(jobId);
  } catch (error: any) {
    errorMessage = error.message;
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <span className="eyebrow">Analysis Results</span>
        <h1>Segment feedback for your uploaded video.</h1>
        <p>
          Review the mock output from the Whisper, TRIBE v2, heuristic feature
          extraction, and LLM summary pipeline.
        </p>
      </section>

      <div className="actions" style={{ marginBottom: 18 }}>
        <Link className="button button-secondary" href="/">
          Upload another video
        </Link>
      </div>

      {errorMessage ? (
        <div className="card error-box">{errorMessage}</div>
      ) : resultData ? (
        <div className="results-grid">
          <div className="card">
            <div className="result-card">
              <div className="pill">Job ID: {resultData.job_id}</div>
              <div className="pill">Status: {resultData.status}</div>
              {resultData.audio_path ? (
                <div className="pill">Audio extracted</div>
              ) : null}
              <p className="summary">
                {("summary" in resultData.results) ? resultData.results.summary : "No summary available yet."}
              </p>
            </div>
          </div>

          {resultData.video_filename ? (
            <InteractiveViewer 
              videoUrl={`http://localhost:5001/uploads/${resultData.video_filename}`}
              segments={resultData.results?.segments || []}
              transcript={resultData.transcript || []}
            />
          ) : (
            <p className="summary" style={{ marginTop: "2rem" }}>Video not available for interactive playback.</p>
          )}
        </div>
      ) : null}
    </main>
  );
}
