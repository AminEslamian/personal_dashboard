import React from 'react';
import Link from 'next/link';

const TerminalIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>;

export default function TelemetryDefinition() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 p-8 font-sans selection:bg-indigo-500/30 flex items-center justify-center">
      <div className="max-w-2xl bg-zinc-900/40 border border-zinc-800/50 p-8 md:p-12 rounded-xl shadow-2xl relative overflow-hidden">
        
        {/* Subtle background glow effect */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-8 relative z-10">
          <TerminalIcon className="w-6 h-6 text-indigo-400" />
          <h1 className="text-sm font-bold text-zinc-400 tracking-widest uppercase">System.Dictionary</h1>
        </div>

        <div className="space-y-6 relative z-10">
          <div>
            <h2 className="text-4xl font-bold text-zinc-100 tracking-tight mb-2">te·lem·e·try</h2>
            <p className="text-sm text-indigo-400 font-medium">/təˈlemətrē/ • noun</p>
          </div>
          
          <div className="pl-5 border-l-2 border-zinc-800 text-zinc-300 leading-relaxed text-lg">
            <p className="mb-4">
              The word comes from the Greek roots <strong className="text-zinc-100">tele</strong> (meaning "remote" or "far off") and <strong className="text-zinc-100">metron</strong> (meaning "measure"). 
            </p>
            <p className="text-zinc-400">
              Essentially, it is the automatic recording and transmission of data from remote or inaccessible sources to an IT system in a different location for monitoring and analysis.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-800/50 relative z-10">
          <Link 
            href="/" 
            className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors uppercase tracking-wider font-bold flex items-center gap-2 w-fit"
          >
            ← Return to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}