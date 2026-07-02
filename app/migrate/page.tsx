"use client";

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function MigratePage() {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsLoading(true);
        setStatus('Parsing JSON file...');
        const fileContent = event.target?.result as string;
        const data = JSON.parse(fileContent);
        
        const sessions = Array.isArray(data) ? data : (data.sessions || []);
        
        if (sessions.length === 0) {
          setStatus('No sessions found in the file.');
          setIsLoading(false);
          return;
        }

        setStatus(`Found ${sessions.length} sessions. Uploading to Supabase...`);

        const records = sessions.map((s: any) => ({
          macro: s.macro,
          subject: s.subject,
          hours: Number(s.hours),
          type: s.type,
          date: s.date
        }));

        const { error } = await supabase.from('sessions').insert(records);

        if (error) {
          throw error;
        }

        setStatus(`✅ Success! Migrated ${sessions.length} records.\n\nRedirecting you to the dashboard...`);
        
        // Go back to the dashboard after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);

      } catch (err: any) {
        setStatus(`❌ Error: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 text-zinc-100 font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl text-center relative z-10">
        <h1 className="text-2xl font-bold mb-4 text-indigo-400">Migrate Local Data</h1>
        <p className="text-sm text-zinc-400 mb-8">
          Select your old <code className="bg-zinc-800 px-1 rounded text-zinc-300">db.json</code> file. This tool will automatically securely upload all your past history directly into your Supabase account.
        </p>

        <label className={`w-full flex flex-col justify-center items-center py-8 px-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isLoading ? 'border-zinc-700 bg-zinc-900/50 cursor-not-allowed' : 'border-indigo-500/50 hover:bg-indigo-500/10'}`}>
          <svg className="w-8 h-8 mb-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span className="font-medium text-lg">{isLoading ? 'Uploading...' : 'Select db.json File'}</span>
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            onChange={handleFileUpload}
            disabled={isLoading}
          />
        </label>

        {status && (
          <div className="mt-6 p-4 rounded-lg bg-zinc-950/80 border border-zinc-800 text-sm whitespace-pre-wrap font-medium">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
