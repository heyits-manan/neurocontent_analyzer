import Link from "next/link";

import { getResults } from "../../lib/api";

export default async function ResultsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const jobId = resolvedSearchParams?.jobId;

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

  let resultData;
  let errorMessage = "";

  try {
    resultData = await getResults(jobId);
  } catch (error) {
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
      ) : (
        <div className="results-grid">
          <div className="card">
            <div className="result-card">
              <div className="pill">Job ID: {resultData.job_id}</div>
              <div className="pill">Status: {resultData.status}</div>
              {resultData.audio_path ? (
                <div className="pill">Audio extracted</div>
              ) : null}
              <p className="summary">
                {resultData.results?.summary || "No summary available yet."}
              </p>
            </div>
          </div>

          <div className="card result-card">
            <div className="result-meta">
              <span className="pill">
                Transcript Segments: {(resultData.transcript || []).length}
              </span>
            </div>
            {(resultData.transcript || []).length > 0 ? (
              (resultData.transcript || []).map((segment, index) => (
                <div key={`${segment.start}-${segment.end}-${index}`}>
                  <strong>
                    {segment.start}s - {segment.end}s
                  </strong>
                  <p className="summary">{segment.text}</p>
                </div>
              ))
            ) : (
              <p className="summary">Transcript is not available for this job yet.</p>
            )}
          </div>

          {(resultData.results?.segments || []).map((segment) => (
            <div className="card result-card" key={`${segment.start}-${segment.end}`}>
              <div className="result-meta">
                <span className="pill">
                  Segment {segment.start}s - {segment.end}s
                </span>
                <span className="pill">Load: {segment.load}</span>
                <span className="pill">Attention: {segment.attention}</span>
              </div>
              <div>
                <strong>Issue</strong>
                <p className="summary">{segment.issue}</p>
              </div>
              <div>
                <strong>Suggestion</strong>
                <p className="summary">{segment.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
