import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Mail, ArrowRight, ShieldCheck, ArrowLeft, 
  AlertCircle, Database, BookOpen, X, ExternalLink, 
  Key, CheckCircle2, Sparkles 
} from 'lucide-react';
import { signInAdmin, isSupabaseConfigured } from '../../lib/supabase';

export default function AdminLogin({ onLoginSuccess, onBackToPortfolio }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSetupModal, setShowSetupModal] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { user, error } = await signInAdmin(email, password);
      if (error) {
        setErrorMsg(error.message || 'Authentication failed. Please verify credentials.');
      } else if (user) {
        onLoginSuccess(user);
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setEmail('admin@mayank.studio');
    setPassword('mayank2026');
  };

  return (
    <div className="min-h-screen bg-studio-bg flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-electric-indigo/15 blur-[160px] rounded-full pointer-events-none" />

      {/* Top navigation row */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToPortfolio}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSetupModal(true)}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-electric-blue hover:text-white transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Supabase Setup Guide</span>
        </button>
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-3xl bg-studio-card border border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] p-8 sm:p-10 relative overflow-hidden"
      >
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-electric-indigo to-electric-blue flex items-center justify-center text-white mb-6 shadow-electric-glow">
          <Lock className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-heading font-bold text-white tracking-tight">
          Studio Admin Portal
        </h1>
        <p className="mt-1 text-xs text-studio-muted font-normal leading-relaxed">
          Manage your video portfolio, upload commercial media, and publish projects.
        </p>

        {/* Database Status Pill */}
        <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px] font-sans">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Database className="w-3.5 h-3.5 text-electric-blue" /> Cloud Database:
          </span>
          {isConfigured ? (
            <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected (Supabase Live)
            </span>
          ) : (
            <span className="text-amber-400 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Demo / Guided Mode
            </span>
          )}
        </div>

        {/* Informational callout if not configured */}
        {!isConfigured && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-sans space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[11px] flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                Supabase Not Connected Yet
              </span>
              <button
                type="button"
                onClick={() => setShowSetupModal(true)}
                className="text-[11px] font-mono text-amber-300 underline hover:text-white"
              >
                How to Connect &rarr;
              </button>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Your <code>.env</code> file is currently unconfigured. You can log in with demo credentials below to test the UI, or connect your Supabase project for real authentication and cloud storage.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-sans flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-sans font-medium text-slate-300 block mb-1.5">
              {isConfigured ? 'Admin Email (Your Supabase Account)' : 'Admin Email'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder={isConfigured ? "your-admin-email@example.com" : "admin@mayank.studio"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-studio-surface border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 font-sans focus:outline-none focus:border-electric-indigo transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-sans font-medium text-slate-300 block mb-1.5">
              {isConfigured ? 'Password (Your Supabase Password)' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-studio-surface border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 font-sans focus:outline-none focus:border-electric-indigo transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-electric-indigo to-electric-blue text-white text-xs font-sans font-semibold shadow-electric-glow hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Helper if Supabase is not configured yet */}
        {!isConfigured && (
          <div className="mt-6 pt-5 border-t border-white/5 space-y-2 text-center">
            <p className="text-[11px] font-mono text-slate-400">
              Want to preview the dashboard right now?
            </p>
            <button
              type="button"
              onClick={handleUseDemo}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-electric-blue hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              Fill Demo Credentials (admin@mayank.studio)
            </button>
          </div>
        )}

      </motion.div>

      {/* Supabase Activation Modal */}
      <AnimatePresence>
        {showSetupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-studio-card border border-white/10 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-electric-blue" />
                  <h3 className="text-base font-heading font-bold text-white tracking-tight">
                    How to Activate Real Supabase Authentication
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close guide"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
                <p>
                  To switch from Demo mode to real Supabase authentication, follow these 5 quick steps:
                </p>

                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="font-mono text-electric-blue font-semibold block text-xs">
                    Step 1: Create a Free Project on Supabase
                  </span>
                  <p className="text-slate-400 text-xs">
                    Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-white underline">supabase.com</a>, log in or sign up for free, and click <strong>New Project</strong>. Choose a name (e.g. <code>Mayank-Portfolio</code>) and set a secure database password.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="font-mono text-electric-blue font-semibold block text-xs">
                    Step 2: Run the SQL Schema & Auto-Create Buckets
                  </span>
                  <p className="text-slate-400 text-xs">
                    In your Supabase sidebar, open <strong>SQL Editor</strong> &rarr; <strong>New Query</strong>. Copy the SQL script from <code>DATABASE_SETUP.md</code> in your project and click <strong>RUN</strong>. This creates the projects table, index ordering, storage buckets (<code>videos</code> & <code>thumbnail</code>), and all security policies.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="font-mono text-electric-blue font-semibold block text-xs">
                    Step 3: Storage Buckets (Auto-Created via SQL)
                  </span>
                  <p className="text-slate-400 text-xs">
                    The SQL script automatically creates your storage buckets with public streaming:
                    <br />• Bucket 1: <code>videos</code> — Public: <strong>ON</strong>
                    <br />• Bucket 2: <code>thumbnail</code> — Public: <strong>ON</strong>
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="font-mono text-electric-blue font-semibold block text-xs">
                    Step 4: Create Your Admin Account
                  </span>
                  <p className="text-slate-400 text-xs">
                    In Supabase, go to <strong>Authentication</strong> &rarr; <strong>Users</strong> &rarr; <strong>Add user</strong> &rarr; <strong>Create user</strong>.
                    Enter your email and strong password, and toggle <strong>Auto Confirm User?</strong> to <strong>ON</strong>.
                  </p>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <span className="font-mono text-electric-blue font-semibold block text-xs">
                    Step 5: Add Credentials to .env & Restart Server
                  </span>
                  <p className="text-slate-400 text-xs">
                    Go to <strong>Project Settings &rarr; API</strong>, copy your <strong>Project URL</strong> and <strong>anon public key</strong>, and paste them into <code>.env</code> in your project:
                  </p>
                  <pre className="p-3 rounded-xl bg-black/90 text-cyan-300 font-mono text-[11px] overflow-x-auto border border-white/10">
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
                  </pre>
                  <p className="text-slate-400 text-[11px]">
                    Save <code>.env</code> and restart your dev server (<code>npm run dev</code>). The badge will automatically change to <span className="text-emerald-400 font-semibold">Connected (Supabase Live)</span>!
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-xs font-mono hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Close Guide
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

