"use client";

import { useRef, useState } from "react";
import { SegmentAnalysis } from "../lib/types";

interface InteractiveViewerProps {
  videoUrl: string;
  segments: SegmentAnalysis[];
}

export default function InteractiveViewer({ videoUrl, segments }: InteractiveViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

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

  return (
    <div className="viewer-container">
      <div className="video-wrapper card" style={{ padding: "0", overflow: "hidden", marginBottom: "2rem" }}>
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          onTimeUpdate={handleTimeUpdate}
          style={{ width: "100%", display: "block", background: "#000" }}
        />
      </div>

      <h3>Segment Analysis</h3>
      <div className="results-grid">
        {(segments || []).length === 0 ? (
          <p>No segments available for timeline view.</p>
        ) : (
          segments.map((segment) => {
            const isActive = currentTime >= segment.start && currentTime < segment.end;
            
            return (
              <div 
                className={`card result-card segment-card ${isActive ? "active-segment" : ""}`} 
                key={`${segment.start}-${segment.end}`}
                onClick={() => jumpToSegment(segment.start)}
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  transform: isActive ? "scale(1.02)" : "scale(1)",
                  border: isActive ? "2px solid #0070f3" : "1px solid #eaeaea",
                  boxShadow: isActive ? "0 8px 30px rgba(0,112,243,0.12)" : "none"
                }}
              >
                <div className="result-meta">
                  <span className="pill" style={{ background: isActive ? "#0070f3" : "#f1f1f1", color: isActive ? "#fff" : "#333" }}>
                    {segment.start}s - {segment.end}s
                  </span>
                  <span className="pill">Load: {segment.load}</span>
                  <span className="pill">Attention: {segment.attention}</span>
                </div>
                
                {/* 
                <div style={{ marginBottom: "1rem" }}>
                  <p className="summary" style={{ fontStyle: "italic", borderLeft: "3px solid #ccc", paddingLeft: "10px", margin: "10px 0" }}>
                    "{segment.text}"
                  </p>
                </div> 
                */}

                <div>
                  <strong>Issue: {segment.issue}</strong>
                  {segment.reason && <p className="summary" style={{ marginTop: "4px" }}>{segment.reason}</p>}
                </div>
                
                <div style={{ marginTop: "12px" }}>
                  <strong>Suggestion</strong>
                  <p className="summary">{segment.suggestion}</p>
                </div>

                {segment.rewrite && (
                  <div style={{ marginTop: "12px", padding: "10px", background: "#f9fcff", borderRadius: "6px" }}>
                    <strong>Try saying this instead:</strong>
                    <p className="summary" style={{ marginBottom: 0 }}>{segment.rewrite}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
