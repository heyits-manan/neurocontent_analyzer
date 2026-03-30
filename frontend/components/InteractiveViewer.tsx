"use client";

import { useRef, useState, useEffect } from "react";
import { SegmentAnalysis, TranscriptSegment } from "../lib/types";

interface InteractiveViewerProps {
  videoUrl: string;
  segments: SegmentAnalysis[];
  transcript: TranscriptSegment[];
}

export default function InteractiveViewer({ videoUrl, segments, transcript }: InteractiveViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  // Track the actively viewed segment in the carousel
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const jumpToSegment = (startSeconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startSeconds;
      videoRef.current.play().catch(() => {});
    }
  };

  // Auto-scroll the transcript to the active line
  useEffect(() => {
    if (!transcriptRef.current) return;
    
    const activeLine = transcriptRef.current.querySelector('.active-transcript');
    if (activeLine) {
      activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime]);

  // Keep the carousel synced dynamically with the video playback
  useEffect(() => {
    if (!segments || segments.length === 0) return;
    
    // Find the first segment that encompasses the current time
    const currentIndex = segments.findIndex(s => currentTime >= s.start && currentTime < s.end);
    
    if (currentIndex !== -1 && currentIndex !== activeSegmentIndex) {
      setActiveSegmentIndex(currentIndex);
    }
  }, [currentTime, segments, activeSegmentIndex]);

  // Handle Carousel Prev / Next Buttons
  const goToPreviousSegment = () => {
    if (activeSegmentIndex > 0) {
      const newIndex = activeSegmentIndex - 1;
      setActiveSegmentIndex(newIndex);
      jumpToSegment(segments[newIndex].start);
    }
  };

  const goToNextSegment = () => {
    if (activeSegmentIndex < (segments?.length || 0) - 1) {
      const newIndex = activeSegmentIndex + 1;
      setActiveSegmentIndex(newIndex);
      jumpToSegment(segments[newIndex].start);
    }
  };

  return (
    <div className="interactive-layout">
      
      {/* LEFT COLUMN: Video & AI Diagnostics Carousel */}
      <div className="viewer-container">
        <div className="video-wrapper card" style={{ padding: "0", overflow: "hidden", marginBottom: "2rem" }}>
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            onTimeUpdate={handleTimeUpdate}
            style={{ width: "100%", display: "block", background: "#000", maxHeight: "60vh", objectFit: "contain" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0 }}>Segment Analysis</h3>
          {segments && segments.length > 0 && (
            <div style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
              Analysis {activeSegmentIndex + 1} of {segments.length}
            </div>
          )}
        </div>

        <div className="carousel-container">
          {(segments || []).length === 0 ? (
            <p>No segments available for timeline view.</p>
          ) : (
            <div 
              className="card result-card segment-card active-segment" 
              style={{
                border: "2px solid var(--accent)",
                boxShadow: "var(--shadow)",
                position: "relative",
                paddingBottom: "4rem" // Space for bottom controls
              }}
            >
              {/* Highlight Pill Row */}
              <div className="result-meta">
                <span className="pill" style={{ background: "var(--accent)", color: "#fff" }}>
                  {segments[activeSegmentIndex].start}s - {segments[activeSegmentIndex].end}s
                </span>
                <span className="pill">Load: {segments[activeSegmentIndex].load}</span>
                <span className="pill">Attention: {segments[activeSegmentIndex].attention}</span>
              </div>

              {/* Dynamic Content */}
              <div>
                <strong>Issue: {segments[activeSegmentIndex].issue}</strong>
                {segments[activeSegmentIndex].reason && <p className="summary" style={{ marginTop: "4px" }}>{segments[activeSegmentIndex].reason}</p>}
              </div>
              
              <div style={{ marginTop: "12px" }}>
                <strong>Suggestion</strong>
                <p className="summary">{segments[activeSegmentIndex].suggestion}</p>
              </div>

              {segments[activeSegmentIndex].rewrite && (
                <div style={{ marginTop: "12px", padding: "10px", background: "var(--surface-strong)", borderRadius: "6px" }}>
                  <strong>Try saying this instead:</strong>
                  <p className="summary" style={{ marginBottom: 0 }}>{segments[activeSegmentIndex].rewrite}</p>
                </div>
              )}

              {/* Carousel Navigation Buttons */}
              <div style={{ 
                position: "absolute", 
                bottom: "16px", right: "16px", left: "16px",
                display: "flex", 
                justifyContent: "space-between",
                paddingTop: "12px",
                borderTop: "1px solid var(--border)"
              }}>
                <button 
                  className="button button-secondary"
                  onClick={goToPreviousSegment}
                  disabled={activeSegmentIndex === 0}
                  style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                >
                  ← Previous
                </button>
                <button 
                  className="button button-primary"
                  onClick={goToNextSegment}
                  disabled={activeSegmentIndex === segments.length - 1}
                  style={{ padding: "8px 16px", fontSize: "0.9rem" }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Sticky Transcript List */}
      <div className="card sticky-sidebar">
        <div className="result-meta" style={{ marginBottom: "16px" }}>
          <span className="pill">
            Transcript Segments: {(transcript || []).length}
          </span>
        </div>
        
        <div ref={transcriptRef} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {(transcript || []).length > 0 ? (
            transcript.map((segment: TranscriptSegment, index: number) => {
              const isActive = currentTime >= segment.start && currentTime < segment.end;

              return (
                <div 
                  key={`ts-${segment.start}-${segment.end}-${index}`}
                  className={isActive ? "active-transcript" : ""}
                  onClick={() => jumpToSegment(segment.start)}
                  style={{
                    padding: "12px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    background: isActive ? "rgba(198, 93, 46, 0.1)" : "transparent",
                    borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
                    transition: "background 0.2s ease"
                  }}
                >
                  <strong style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem", color: "var(--muted)" }}>
                    {segment.start}s - {segment.end}s
                  </strong>
                  <p className="summary" style={{ margin: 0, color: isActive ? "var(--text)" : "var(--muted)" }}>
                    {segment.text}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="summary">Transcript is not available for this job yet.</p>
          )}
        </div>
      </div>

    </div>
  );
}
