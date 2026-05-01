'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CyberBackground from '@/components/CyberBackground';
import { Bot, Eye, EyeOff, ArrowRight, Lock, Mail, User, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revuchat-ai.vercel.app';
      // console.log('Signup redirect URL:', redirectUrl);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      // console.log('Signup response:', { data, error: signUpError });

      if (signUpError) {
        // Handle specific error messages
        if (signUpError.message.includes('over_email_send_rate_limit') || signUpError.message.includes('rate limit')) {
          setError('Too many attempts. Please try again after a few minutes.');
        } else if (signUpError.message.includes('User already registered') || signUpError.message.includes('already registered')) {
          setError('Account already exists. Please sign in.');
        } else if (signUpError.message.includes('Failed to fetch') || signUpError.message.includes('network')) {
          setError('Network issue. Please check your connection.');
        } else {
          setError('Something went wrong. Please try again.');
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
        
        setCooldown(true);
        setTimeout(() => setCooldown(false), 60000);
        return;
      }

      if (data.user) {
        // Show success message
        setSuccess(true);
        // Start cooldown to prevent spam
        setCooldown(true);
        setTimeout(() => setCooldown(false), 60000); // 60 second cooldown
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network issue. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
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
          <h1 className="text-3xl font-black text-white">Create your account</h1>
          <p className="text-white/40 text-sm mt-2">Get started with RevUchat AI</p>
        </div>

        {/* Card */}
        <div
          className="glass-card p-8"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm text-white/60 mb-2 font-medium">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/30 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

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
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
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

            {success && (
              <div className="text-sm text-[#39ff87] bg-[#39ff87]/10 border border-[#39ff87]/20 rounded-lg px-4 py-3">
                Verification email sent. Please check your inbox to activate your account.
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success || cooldown}
              className="btn-neon-solid w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : cooldown ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="flex items-center gap-2 text-xs text-white/40">
              <Info size={12} />
              <span>A verification email will be sent to your email address after signup.</span>
            </div>
          </form>

          <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-center text-xs text-white/30">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-white/30 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#39ff87] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
