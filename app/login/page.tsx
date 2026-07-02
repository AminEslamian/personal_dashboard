import { login, signup } from './actions'
import Link from 'next/link'

// Using similar SVG icons as the dashboard for consistency
const TerminalIcon = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>;

export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams;
  const message = searchParams.message;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.15)]">
              <TerminalIcon className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight mb-2">Welcome Back</h1>
          <p className="text-sm text-zinc-400">Authenticate to access your telemetry dashboard</p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 p-8 rounded-2xl shadow-2xl relative">
          
          <form className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
              />
            </div>

            {message && (
              <div className="mt-2 text-sm text-center p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                {message}
              </div>
            )}

            <div className="flex flex-col gap-3 mt-4">
              <button
                formAction={login}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all flex justify-center items-center gap-2 group"
              >
                Sign In
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              
              <button
                formAction={signup}
                className="w-full bg-transparent hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium py-3 rounded-lg transition-all flex justify-center items-center gap-2"
              >
                Create Account
              </button>
            </div>
          </form>

        </div>
        
        <p className="text-center text-xs text-zinc-500 mt-8">
          Secure authentication provided by <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Supabase</a>
        </p>
      </div>
    </div>
  )
}
