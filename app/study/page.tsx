"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// --- Raw SVG Components (reuse from main page) ---
const TerminalIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const ClockIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const FlameIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

// Custom Study Icon (book)
const StudyIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 6c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
    <path d="M6 6v12" />
    <path d="M18 6v12" />
    <path d="M8 10h8" />
    <path d="M8 14h4" />
  </svg>
);

// Helper
const getLocalDateString = (dateObj: Date) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function StudyPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch sessions (same API endpoint)
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/sessions');
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
        }
      } catch (error) {
        console.error("Failed to load study telemetry:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchSessions();
  }, []);

  // Aggregate study sessions by subject (lesson)
  const studySessions = sessions
    .filter(s => s.macro === 'Study')
    .reduce((acc: Record<string, number>, curr) => {
      const subject = curr.subject.trim();
      if (subject) {
        acc[subject] = (acc[subject] || 0) + curr.hours;
      }
      return acc;
    }, {});

  const lessons = Object.entries(studySessions)
    .map(([name, hours]) => ({ name, hours: Math.round(hours * 100) / 100 }))
    .sort((a, b) => b.hours - a.hours); // descending by hours

  const totalStudyHours = lessons.reduce((sum, l) => sum + l.hours, 0);
  const maxHours = lessons.length > 0 ? Math.max(...lessons.map(l => l.hours)) : 0;

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-sans">
        <div className="flex items-center gap-2">
          <StudyIcon className="w-5 h-5 animate-pulse text-indigo-500" />
          <span>Loading study progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-8 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="mb-10 border-b border-zinc-800/50 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <StudyIcon className="w-7 h-7 text-indigo-400" />
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            Study Telemetry — Lesson Progress
          </h1>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-zinc-500">
            Visual comparison of hours invested per subject
          </p>
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-indigo-400 transition-colors"
          >
            <TerminalIcon className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {[
          {
            label: "Total Study Hours",
            value: `${totalStudyHours.toFixed(1)}h`,
            icon: ClockIcon,
          },
          {
            label: "Topics Covered",
            value: `${lessons.length}`,
            icon: StudyIcon,
          },
          {
            label: "Top Lesson",
            value: lessons.length > 0 ? lessons[0].name : "—",
            icon: FlameIcon,
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-zinc-900/40 border border-zinc-800/50 p-5 rounded-xl hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2 text-zinc-400">
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <p className="text-2xl font-semibold text-zinc-100 truncate">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Lesson bars */}
      {lessons.length === 0 ? (
        <div className="text-center py-20 text-zinc-600 italic">
          No study sessions recorded. Start logging to see progress.
        </div>
      ) : (
        <div className="space-y-5">
          {lessons.map((lesson) => {
            const percentage = maxHours > 0 ? (lesson.hours / maxHours) * 100 : 0;
            const barColor = `hsl(${(percentage * 1.2) % 360}, 70%, 65%)`; // dynamic hue based on %
            return (
              <div key={lesson.name} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-200 truncate max-w-[200px] sm:max-w-xs">
                      {lesson.name}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">
                      {lesson.hours.toFixed(1)}h
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {Math.round(percentage)}% of peak
                  </span>
                </div>
                <div className="w-full bg-zinc-900 border border-zinc-800 rounded-full h-4 overflow-hidden relative">
                  {/* Background track with subtle texture */}
                  <div className="absolute inset-0 bg-zinc-950 opacity-50" />
                  {/* Progress fill */}
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: barColor,
                      boxShadow: `0 0 12px ${barColor}40`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer hint */}
      <div className="mt-12 pt-6 border-t border-zinc-800/50 text-xs text-zinc-600 text-center">
        Bars compare each lesson's hours against the most studied lesson (100%). Hover for precise percentage.
      </div>
    </div>
  );
}