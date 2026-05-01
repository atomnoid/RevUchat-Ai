'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CyberBackground from '@/components/CyberBackground';
import { Bot, Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { loginSchema } from '@/lib/validators';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate input using login schema
      const validationResult = loginSchema.safeParse({ email, password });
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0]?.message;
        setError(firstError || 'Invalid input');
        setLoading(false);
        return;
      }

      console.log('[LOGIN] Attempting signInWithPassword for:', email);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('[LOGIN] Supabase response:', { data, error: signInError });

      if (signInError) {
        // Handle specific error messages with user-friendly responses
        const errorMsg = signInError.message.toLowerCase();
        
        if (errorMsg.includes('invalid login credentials') || 
            errorMsg.includes('invalid email or password') ||
            errorMsg.includes('wrong') ||
            errorMsg.includes('invalid_credentials')) {
          setError('Invalid email or password');
        } else if (errorMsg.includes('email not confirmed') || 
                   errorMsg.includes('email_not_confirmed') ||
                   errorMsg.includes('not verified')) {
          setError('Please verify your email before logging in');
        } else if (errorMsg.includes('rate limit') || errorMsg.includes('too many requests')) {
          setError('Too many attempts. Please try again later.');
        } else {
          // Generic fallback - log for debugging but show user-friendly message
          console.error('[LOGIN] Auth error:', signInError.message);
          setError('Unable to sign in. Please check your credentials and try again.');
        }
        
        // Log failed auth attempt
        try {
          await fetch('/api/log-auth-failure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
        } catch (logError) {
          // Silently fail logging
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('[LOGIN] Success for user:', data.user.id);
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('[LOGIN] Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <CyberBackground />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(57,255,135,0.15)', border: '1px solid rgba(57,255,135,0.4)' }}
            >
              <Bot size={20} className="text-[#39ff87]" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-white">RevU</span>
              <span className="neon-text">chat</span>
              <span className="text-white/50 text-sm ml-1">AI</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-white">Welcome back</h1>
          <p className="text-white/40 text-sm mt-2">Sign in to your dashboard</p>
        </div>

        {/* Card */}
        <div
          className="glass-card p-8"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-white/60 mb-2 font-medium">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/30 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2 font-medium">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-white/30 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-neon-solid w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/30 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#39ff87] hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
