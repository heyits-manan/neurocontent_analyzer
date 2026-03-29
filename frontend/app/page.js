import UploadForm from "../components/UploadForm";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <span className="eyebrow">NeuroContent Analyzer</span>
        <h1>Audit video learning flow before publishing.</h1>
        <p>
          Upload a lesson recording, trigger the mock AI pipeline, and inspect
          segment-level issues around cognitive load, attention, and clarity.
        </p>
      </section>

      <UploadForm />
    </main>
  );
}

