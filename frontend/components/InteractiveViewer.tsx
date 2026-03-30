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
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_350px] gap-6 items-start">
      
      {/* LEFT COLUMN: Video & AI Diagnostics Carousel */}
      <div className="grid gap-6">
        <div className="bg-surface border border-border-card rounded-[28px] overflow-hidden mb-2 shadow-custom backdrop-blur-md">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            onTimeUpdate={handleTimeUpdate}
            className="w-full block bg-black max-h-[60vh] object-contain"
          />
        </div>

        <div className="flex justify-between items-center mb-1">
          <h3 className="m-0 text-xl font-bold">Segment Analysis</h3>
          {segments && segments.length > 0 && (
            <div className="text-sm text-muted">
              Analysis {activeSegmentIndex + 1} of {segments.length}
            </div>
          )}
        </div>

        <div className="grid gap-4">
          {(segments || []).length === 0 ? (
            <p className="text-muted leading-relaxed">No segments available for timeline view.</p>
          ) : (
            <div 
              className="bg-surface border-2 border-accent rounded-3xl p-6 md:p-8 shadow-custom backdrop-blur-md relative pb-[4.5rem]" 
            >
              {/* Highlight Pill Row */}
              <div className="flex gap-2.5 flex-wrap mb-4">
                <span className="w-fit px-3 py-1.5 rounded-full bg-accent text-white text-sm">
                  {segments[activeSegmentIndex].start}s - {segments[activeSegmentIndex].end}s
                </span>
                <span className="w-fit px-3 py-1.5 rounded-full bg-[#efe3d2] text-accentdark text-sm">Load: {segments[activeSegmentIndex].load}</span>
                <span className="w-fit px-3 py-1.5 rounded-full bg-[#efe3d2] text-accentdark text-sm">Attention: {segments[activeSegmentIndex].attention}</span>
              </div>

              {/* Dynamic Content */}
              <div>
                <strong className="block mb-1">Issue: {segments[activeSegmentIndex].issue}</strong>
                {segments[activeSegmentIndex].reason && <p className="text-muted leading-relaxed mt-1 text-sm">{segments[activeSegmentIndex].reason}</p>}
              </div>
              
              <div className="mt-4">
                <strong className="block mb-1">Suggestion</strong>
                <p className="text-muted leading-relaxed m-0">{segments[activeSegmentIndex].suggestion}</p>
              </div>

              {segments[activeSegmentIndex].rewrite && (
                <div className="mt-4 p-3 bg-surfacestrong rounded-lg">
                  <strong className="block mb-1">Try saying this instead:</strong>
                  <p className="text-muted leading-relaxed m-0">{segments[activeSegmentIndex].rewrite}</p>
                </div>
              )}

              {/* Carousel Navigation Buttons */}
              <div className="absolute bottom-4 right-4 left-4 flex justify-between pt-3 border-t border-border-card">
                <button 
                  className="border-0 rounded-full px-4 py-2 cursor-pointer transition-all duration-200 hover:-translate-y-[1px] disabled:opacity-55 disabled:cursor-not-allowed bg-[#ece2d6] text-textbody font-inherit text-sm"
                  onClick={goToPreviousSegment}
                  disabled={activeSegmentIndex === 0}
                >
                  &larr; Previous
                </button>
                <button 
                  className="border-0 rounded-full px-4 py-2 cursor-pointer transition-all duration-200 hover:-translate-y-[1px] disabled:opacity-55 disabled:cursor-not-allowed bg-accent text-white font-inherit text-sm"
                  onClick={goToNextSegment}
                  disabled={activeSegmentIndex === segments.length - 1}
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Sticky Transcript List */}
      <div className="bg-surface border border-border-card rounded-3xl p-6 shadow-custom backdrop-blur-md sticky top-6 max-h-[calc(100vh-48px)] overflow-y-auto">
        <div className="flex gap-2.5 flex-wrap mb-4">
          <span className="w-fit px-3 py-1.5 rounded-full bg-[#efe3d2] text-accentdark text-sm font-semibold">
            Transcript Segments: {(transcript || []).length}
          </span>
        </div>
        
        <div ref={transcriptRef} className="flex flex-col gap-3">
          {(transcript || []).length > 0 ? (
            transcript.map((segment: TranscriptSegment, index: number) => {
              const isActive = currentTime >= segment.start && currentTime < segment.end;

              return (
                <div 
                  key={`ts-${segment.start}-${segment.end}-${index}`}
                  className={`${isActive ? "active-transcript bg-accent/10 border-accent" : "bg-transparent border-transparent"} p-3 rounded-xl cursor-pointer border-l-[3px] transition-colors duration-200`}
                  onClick={() => jumpToSegment(segment.start)}
                >
                  <strong className="block mb-1 text-[0.85rem] text-muted">
                    {segment.start}s - {segment.end}s
                  </strong>
                  <p className={`m-0 leading-relaxed ${isActive ? "text-textbody" : "text-muted"}`}>
                    {segment.text}
                  </p>
                </div>
              );
            })
          ) : (
            <p className="text-muted leading-relaxed">Transcript is not available for this job yet.</p>
          )}
        </div>
      </div>

    </div>
  );
}
