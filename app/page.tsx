"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { celebrate } from './fireworks';
// --- Raw SVG Components ---
const TerminalIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>;
const ClockIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/>
    <polyline className="clock-hands" points="12 6 12 12 16 14"/>
  </svg>
);
const ZapIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const FlameIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const XIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const PlusIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const CalendarIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const TrashIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
// For study page reference:
const StudyIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 6c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
    <path d="M6 6v12" />
    <path d="M18 6v12" />
    <path d="M8 10h8" />
    <path d="M8 14h4" />
  </svg>
);

// Helper to format dates for the UI
const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

// Helper to get local YYYY-MM-DD string
const getLocalDateString = (dateObj: Date) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// // Add or modify macros here. The rest of the app will update automatically.
const MACROS = [
  { name: 'Study', color: 'text-indigo-400 border-indigo-500/30', hex: '#6366f1' },
  { name: 'Investigation', color: 'text-emerald-400 border-emerald-500/30', hex: '#10b981' },
  { name: 'Work', color: 'text-amber-400 border-amber-500/30', hex: '#f59e0b' },
  { name: 'Auxiliary', color: 'text-zinc-400 border-zinc-500/30', hex: '#71717a' }, // 👈 NEW
];

export default function Page() {
  // App State
  const [sessions, setSessions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Form State
  const [macro, setMacro] = useState('Study');
  const [subject, setSubject] = useState(''); 
  const [hours, setHours] = useState('');      
  const [workType, setWorkType] = useState('Deep Work');
  const [logDate, setLogDate] = useState(() => getLocalDateString(new Date()));

  // Load from local API on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/sessions');
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
        }
      } catch (error) {
        console.error("Failed to boot telemetry:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchSessions();
  }, []);

  // --- Celebration Logic ---
  useEffect(() => {
    if (!isLoaded || sessions.length === 0) return;
    
    const todayStr = getLocalDateString(new Date());
    const todayHours = sessions
      .filter(s => s.date.startsWith(todayStr))
      .reduce((sum, s) => sum + s.hours, 0);

    const celebratedKey = `celebrated_${todayStr}`;

    // Only fire if > 6 hours and hasn't celebrated today yet
    if (todayHours > 6) {
      if (!localStorage.getItem(celebratedKey)) {
        celebrate();
        localStorage.setItem(celebratedKey, 'true');
      }
    } else {
      // If we go back down to 6 or below, clear the flag so it can fire again!
      localStorage.removeItem(celebratedKey);
    }
  }, [sessions, isLoaded]);

  const handleLogSession = async () => {
    if (!subject.trim() || !hours) return;

    const now = new Date();
    const timeString = now.toISOString().split('T')[1];
    const finalIsoDate = `${logDate}T${timeString}`;

    const newSession = {
      id: Date.now(),
      macro,
      subject,
      hours: parseFloat(hours),
      type: workType,
      date: finalIsoDate 
    };

    // Optimistic UI update for instant feedback
    const updatedSessions = [newSession, ...sessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setSessions(updatedSessions); 
    
    // Reset form immediately
    setSubject(''); 
    setHours('');
    setLogDate(getLocalDateString(new Date())); 
    setIsModalOpen(false); 

    // Background sync to your db.json
    try {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      });
    } catch (error) {
      console.error("Failed to write to db.json:", error);
    }
  };

  const handleDeleteSession = async (idToDelete: number) => {
    // Optimistic UI update
    const updatedSessions = sessions.filter(session => session.id !== idToDelete);
    setSessions(updatedSessions);

    // Background sync to delete from db.json
    try {
      await fetch('/api/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idToDelete })
      });
    } catch (error) {
      console.error("Failed to delete from db.json:", error);
    }
  };

  const getMacroColor = (cat: string) => {
  return MACROS.find(m => m.name === cat)?.color || '';
};

  const getMacroHex = (cat: string) => {
  return MACROS.find(m => m.name === cat)?.hex || '#71717a';
};

  // --- DYNAMIC DATA CALCULATIONS ---

  // 1. Total Hours
  const totalLoggedHours = sessions.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1);

  // --- Duration-Based Deep Work Ratio ---
  const calculateDeepWorkRatio = () => {
    if (sessions.length === 0) return '0%';

    const totals = sessions.reduce((acc, s) => {
      // Add up the actual hours, not the session counts
      if (s.type === 'Deep Work') acc.deep += s.hours;
      if (s.type === 'Deep Work' || s.type === 'Shallow') acc.total += s.hours; 
      return acc;
    }, { deep: 0, total: 0 });

    return totals.total > 0 
      ? `${Math.round((totals.deep / totals.total) * 100)}%` 
      : '0%';
  };
  const deepWorkRatio = calculateDeepWorkRatio();
  // -------------------------------------------

  // 2. Daily Streak Logic
  const calculateStreak = () => {
    if (sessions.length === 0) return 0;

    // Extract unique dates in YYYY-MM-DD format
    const uniqueDates = Array.from(new Set(sessions.map(s => s.date.split('T')[0])));
    
    let currentStreak = 0;
    const todayObj = new Date();
    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);

    const todayStr = getLocalDateString(todayObj);
    const yesterdayStr = getLocalDateString(yesterdayObj);

    let checkDateObj = new Date();

    // The streak must be alive today or yesterday to continue
    if (uniqueDates.includes(todayStr)) {
      currentStreak = 1;
      checkDateObj = todayObj;
    } else if (uniqueDates.includes(yesterdayStr)) {
      currentStreak = 1;
      checkDateObj = yesterdayObj;
    } else {
      return 0; // Streak broken
    }

    // Count backwards day by day
    while (true) {
      checkDateObj.setDate(checkDateObj.getDate() - 1);
      const checkStr = getLocalDateString(checkDateObj);
      if (uniqueDates.includes(checkStr)) {
        currentStreak++;
      } else {
        break;
      }
    }

    return currentStreak;
  };

  const currentStreak = calculateStreak();

  // 3. Real Donut Chart Data
  const getRealDonutData = () => {
    if (sessions.length === 0) return [];
    
    const totals: Record<string, number> = {};

    MACROS.forEach(m => {
      totals[m.name] = 0;
    });
    let totalH = 0;
    
    sessions.forEach(s => {
      totals[s.macro] += s.hours;
      totalH += s.hours;
    });

    if (totalH === 0) return [];

    return Object.keys(totals)
      .map(key => ({
        label: key,
        percentage: Math.round((totals[key] / totalH) * 100),
        color: getMacroHex(key),
      }))
      .filter(item => item.percentage > 0);
  };

  const donutData = getRealDonutData();
  let cumulativePercent = 0;
  const donutSlices = donutData.map(slice => {
    const dashArray = `${slice.percentage} ${100 - slice.percentage}`;
    const dashOffset = 25 - cumulativePercent; 
    cumulativePercent += slice.percentage;
    return { ...slice, dashArray, dashOffset };
  });

  // 4. Real 7-Day Trajectory
  const getWeeklyData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = getLocalDateString(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const hoursLogged = sessions
        .filter(s => s.date.startsWith(dateString))
        .reduce((sum, s) => sum + s.hours, 0);

      days.push({ day: dayName, hours: hoursLogged });
    }
    return days;
  };
  const weeklyData = getWeeklyData();
  const maxWeeklyHours = Math.max(...weeklyData.map(d => d.hours), 8); 

  // 5. Real 60-Day Heatmap
  const getHeatmapData = () => {
    const map = [];
    for (let i = 59; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = getLocalDateString(d);
      
      const hours = sessions
        .filter(s => s.date.startsWith(dateString))
        .reduce((sum, s) => sum + s.hours, 0);
      
      let level = 0;
      if (hours > 0 && hours <= 2) level = 1;
      else if (hours > 2 && hours <= 4) level = 2;
      else if (hours > 4 && hours <= 6) level = 3;
      else if (hours > 6) level = 4;
      
      map.push({ date: dateString, level, hours });
    }
    return map;
  };
  const heatmapData = getHeatmapData();


  // Render Loading State
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-sans">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-5 h-5 animate-pulse text-indigo-500" />
          <span>Booting telemetry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-8 font-sans selection:bg-indigo-500/30 relative">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-zinc-800/50 pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <TerminalIcon className="w-6 h-6 text-indigo-400" />
            ~/
            <Link 
              href="/telemetry-def" 
              className="text-zinc-100 hover:text-indigo-400 transition-colors cursor-help decoration-indigo-500/30 underline-offset-4 hover:underline"
              title="What does this mean?"
            >
              telemetry
            </Link>
            /dashboard
          </h1>
          <p className="text-sm text-zinc-500 mt-1">System wide macro & micro analytics</p>
        </div>
        
        <div className="flex items-center w-full md:w-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white transition-all px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap shadow-[0_0_15px_rgba(79,70,229,0.2)] w-full justify-center md:w-auto"
          >
            <PlusIcon className="w-4 h-4" />
            Log Session
          </button>
        </div>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total Hours Logged", value: `${totalLoggedHours}h`, icon: ClockIcon },
          { label: "Deep Work Ratio", value: deepWorkRatio, icon: ZapIcon }, 
          { label: "Current Streak", value: `${currentStreak} Days`, icon: FlameIcon }, 
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className={`bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-xl hover:border-zinc-700 transition-colors ${
                stat.label === "Current Streak" ? "flame-hover" : ""
              } ${
                stat.label === "Deep Work Ratio" ? "zap-hover" : ""
              } ${
                stat.label === "Total Hours Logged" ? "clock-hover" : ""
              }`}
            >
              <div className="flex items-center gap-3 mb-2 text-zinc-400">
                <Icon 
                  className={`w-5 h-5 transition-all duration-300 ${
                    stat.label === "Current Streak" ? "flame-icon text-zinc-400" : ""
                  } ${
                    stat.label === "Deep Work Ratio" ? "zap-icon text-zinc-400" : ""
                  } ${
                    stat.label === "Total Hours Logged" ? "clock-icon text-zinc-400" : ""
                  }`} 
                />
                <span className="text-xs font-medium uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-3xl font-semibold text-zinc-100">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* MIDDLE ROW: DONUT CHART VS SHORT-TERM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* CIRCULAR CHART */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-xl flex flex-col items-center justify-center min-h-[300px]">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4 self-start w-full border-b border-zinc-800/50 pb-2">Overall Allocation</h2>
          
          {donutSlices.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm italic">
              Awaiting data footprint...
            </div>
          ) : (
            <>
              <div className="relative w-48 h-48 mt-4 mb-6">
                <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90 rounded-full">
                  <circle r="15.91549430918954" cx="16" cy="16" fill="transparent" stroke="#18181b" strokeWidth="4" />
                  {donutSlices.map((slice, i) => (
                    <circle
                      key={i}
                      r="15.91549430918954"
                      cx="16"
                      cy="16"
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth="4"
                      strokeDasharray={slice.dashArray}
                      strokeDashoffset={slice.dashOffset}
                      className="transition-all duration-1000 ease-in-out hover:stroke-[5px] cursor-pointer"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-zinc-100">100%</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Total Load</span>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-x-2 gap-y-3">
                {donutData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }}></div>
                    <span className="text-zinc-300 truncate" title={item.label}>{item.label}</span>
                    <span className="text-zinc-500 ml-auto">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* SHORT TERM BAR CHART */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-xl flex flex-col">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-6">7-Day Trajectory</h2>
          <div className="flex items-end gap-3 h-full pb-4">
            {weeklyData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="w-full bg-zinc-950 rounded-t-md border border-zinc-800/50 flex items-end justify-center relative h-full">
                   <div 
                     className="w-full bg-indigo-500/20 border-t border-indigo-400/50 group-hover:bg-indigo-500/40 transition-all rounded-t-sm" 
                     style={{ height: `${(data.hours / maxWeeklyHours) * 100}%`, minHeight: data.hours > 0 ? '4px' : '0px' }}
                   ></div>
                   <span className="absolute -top-7 text-xs text-zinc-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 px-2 py-1 rounded">{data.hours}h</span>
                </div>
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{data.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: LONG-TERM HEATMAP & ARCHIVES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* HEATMAP */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-xl">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-6">60-Day Persistence Map</h2>
          <div className="flex flex-wrap gap-2">
            {heatmapData.map((dayData, i) => (
              <div 
                key={i} 
                className={`w-5 h-5 rounded-[4px] transition-all hover:scale-110 cursor-pointer ${
                  dayData.level === 0 ? 'bg-zinc-950 border border-zinc-800/50' : 
                  dayData.level === 1 ? 'bg-indigo-900/40 border border-indigo-800/50' : 
                  dayData.level === 2 ? 'bg-indigo-700/60 border border-indigo-800/50' : 
                  dayData.level === 3 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]' :
                  'bg-yellow-400/80 border border-yellow-400/50 shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                }`}
                title={`${dayData.date}: ${dayData.hours} hours logged`}
              />
            ))}
          </div>
        </div>

        {/* RECENT ARCHIVES */}
        <div className="bg-zinc-900/40 border border-zinc-800/50 p-6 rounded-xl h-80 overflow-y-auto custom-scrollbar [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-6">Recent Archives</h2>
          {sessions.length === 0 ? (
             <div className="flex items-center justify-center h-full text-zinc-500 text-sm pb-12">
               No sessions logged yet.
             </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="group flex flex-col border-l-2 border-zinc-800 pl-4 py-1 hover:border-indigo-500/50 transition-colors relative pr-8">
                  
                  {/* DELETE BUTTON */}
                  <button 
                    onClick={() => handleDeleteSession(session.id)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all bg-zinc-900/80 p-1.5 rounded-md"
                    title="Delete Session"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>

                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm border bg-zinc-950 ${getMacroColor(session.macro)}`}>
                      {session.macro}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {formatDate(session.date)}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-200 font-medium truncate pr-2">{session.subject}</span>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-zinc-500">{session.type}</span>
                    <span className="text-xs text-indigo-400 font-medium">{session.hours} hrs</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL OVERLAY --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-32 px-4 transition-all duration-300">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative">
            
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300">
              <XIcon className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
              <TerminalIcon className="w-5 h-5 text-indigo-400" />
              Archive New Session
            </h2>

            <div className="space-y-5">
              
              {/* Date Input */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Date of Session</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <CalendarIcon className="w-4 h-4 text-zinc-500" />
                  </div>
                  <input 
                    type="date" 
                    value={logDate} 
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500/50 transition-all [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
              </div>

              {/* Macro Category Selection */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Macro Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {MACROS.map((cat) => (
                    <button
                      key={cat.name}
                    onClick={() => setMacro(cat.name)}
                    className={`py-2 rounded-lg text-xs font-medium transition-all border ${
                      macro === cat.name
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Input */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Micro Subject / Task</label>
                <input 
                  type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., VHDL Synthesis..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
                />
              </div>

              {/* Hours & Type Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Hours Invested</label>
                  <input 
                    type="number" step="0.5" min="0" value={hours} onChange={(e) => setHours(e.target.value)}
                    placeholder="e.g., 2.5"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Focus Mode</label>
                  <select 
                    value={workType} onChange={(e) => setWorkType(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                  >
                    <option value="Deep Work">Deep Work</option>
                    <option value="Shallow">Shallow</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                onClick={handleLogSession} 
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all flex justify-center items-center gap-2"
              >
                <ClockIcon className="w-5 h-5" />
                Commit Archive
              </button>
            </div>

          </div>
        </div>
      )}
      
    </div>
  );
}