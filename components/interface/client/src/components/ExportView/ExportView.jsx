import { useEffect, useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import { MarkdownRenderer } from "../WorkshopPanel/markdown/MarkdownRenderer";
import "./ExportView.scss";

export function ExportView() {
  const [labspace, setLabspace] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/labspace/export")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load export");
        return response.json();
      })
      .then((data) => setLabspace(data))
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (labspace) {
      document.title = `${labspace.title} — Print View`;
    }
  }, [labspace]);

  if (error) {
    return (
      <div className="export-view p-5">
        <p className="text-danger">
          Failed to load labspace content for export: {error}
        </p>
      </div>
    );
  }

  if (!labspace) {
    return (
      <div className="export-view text-center mt-5">
        <Spinner />
        <p>Loading Labspace content...</p>
      </div>
    );
  }

  return (
    <div className="export-view p-5">
      <header className="export-header mb-4">
        <h1>{labspace.title}</h1>
        {labspace.subtitle && <p className="lead">{labspace.subtitle}</p>}
      </header>
      {labspace.sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="export-section mb-5"
        >
          <MarkdownRenderer>{section.content}</MarkdownRenderer>
        </section>
      ))}
    </div>
  );
}
