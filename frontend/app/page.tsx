import UploadForm from "../components/UploadForm";

export default function HomePage() {
  return (
    <main className="mx-auto w-[min(1200px,calc(100%-32px))] pt-12 pb-20">
      <section className="grid gap-4 mb-8">
        <span className="tracking-[0.12em] uppercase text-accentdark text-sm">
          NeuroContent Analyzer
        </span>
        <h1 className="m-0 text-[clamp(2.6rem,7vw,5rem)] leading-[0.92] max-w-[10ch]">
          Audit video learning flow before publishing.
        </h1>
        <p className="m-0 max-w-[60ch] text-muted text-lg leading-relaxed">
          Upload a lesson recording, trigger the mock AI pipeline, and inspect
          segment-level issues around cognitive load, attention, and clarity.
        </p>
      </section>

      <UploadForm />
    </main>
  );
}
