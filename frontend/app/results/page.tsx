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
      <main className="mx-auto w-[min(1200px,calc(100%-32px))] pt-12 pb-20">
        <div className="bg-surface border border-border-card rounded-3xl p-6 md:p-8 shadow-custom backdrop-blur-md">
          <p className="mb-4">Missing job ID. Upload and process a video first.</p>
          <Link 
            className="inline-block border-0 rounded-full px-5 py-3 cursor-pointer transition-all duration-200 hover:-translate-y-[1px] bg-[#ece2d6] text-textbody" 
            href="/"
          >
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
    <main className="mx-auto w-[min(1200px,calc(100%-32px))] pt-12 pb-20">
      <section className="grid gap-3 mb-8">
        <span className="tracking-[0.12em] uppercase text-accentdark text-sm">Analysis Results</span>
        <h1 className="m-0 text-[clamp(2.6rem,7vw,5rem)] leading-[0.92] max-w-[10ch]">
          Segment feedback for your uploaded video.
        </h1>
        <p className="m-0 max-w-[60ch] text-muted text-lg leading-relaxed">
          Review the output from the Whisper, TRIBE v2, heuristic feature
          extraction, and LLM summary pipeline.
        </p>
      </section>

      <div className="flex gap-3 flex-wrap mb-5">
        <Link 
          className="inline-block border-0 rounded-full px-5 py-3 cursor-pointer transition-all duration-200 hover:-translate-y-[1px] bg-[#ece2d6] text-textbody" 
          href="/"
        >
          Upload another video
        </Link>
      </div>

      {errorMessage ? (
        <div className="bg-surface border border-border-card rounded-3xl p-6 md:p-8 shadow-custom backdrop-blur-md rounded-2xl px-4 py-3 bg-[#a436221a] text-[#8a281d]">{errorMessage}</div>
      ) : resultData ? (
        <div className="grid gap-5">
          {/* Status badges */}
          {(resultData.status === "queued" || resultData.status === "processing") ? (
            <div className="bg-surface border border-border-card rounded-3xl p-6 md:p-8 shadow-custom backdrop-blur-md">
              <div className="flex gap-2 flex-wrap mb-3">
                <div className="w-fit px-3 py-1.5 rounded-full bg-[#efe3d2] text-accentdark text-sm">Job ID: {resultData.job_id}</div>
                <div className="w-fit px-3 py-1.5 rounded-full bg-[#efe3d2] text-accentdark text-sm">Status: {resultData.status}</div>
              </div>
              <p className="text-muted leading-relaxed m-0">
                Your analysis is still being processed. Please refresh this page in a moment.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-surface border border-border-card rounded-3xl p-6 md:p-8 shadow-custom backdrop-blur-md">
                <div className="grid gap-3">
                  <div className="flex gap-2 flex-wrap">
                    <div className="w-fit px-3 py-1.5 rounded-full bg-[#efe3d2] text-accentdark text-sm">Job ID: {resultData.job_id}</div>
                    <div className="w-fit px-3 py-1.5 rounded-full bg-[#efe3d2] text-accentdark text-sm">Status: {resultData.status}</div>
                    {resultData.audio_url ? (
                      <div className="w-fit px-3 py-1.5 rounded-full bg-[#efe3d2] text-accentdark text-sm">Audio extracted</div>
                    ) : null}
                  </div>
                  <p className="text-muted leading-relaxed m-0 mt-2">
                    {("summary" in resultData.results) ? resultData.results.summary : "No summary available yet."}
                  </p>
                </div>
              </div>

              {resultData.video_url ? (
                <InteractiveViewer 
                  videoUrl={resultData.video_url}
                  segments={resultData.results?.segments || []}
                  transcript={resultData.transcript || []}
                />
              ) : (
                <p className="text-muted leading-relaxed mt-8">Video not available for interactive playback.</p>
              )}
            </>
          )}

          {resultData.status === "failed" && resultData.error ? (
            <div className="rounded-2xl px-4 py-3 bg-[#a436221a] text-[#8a281d] leading-relaxed">
              Analysis failed: {resultData.error}
            </div>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
